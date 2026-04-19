import { exportDbBytes, replaceDb } from './db';
import { settingsRepo } from './repos';
import { nowIso, todayIso } from '@/domain/derivations';

const DB_FILENAME = 'taekwondo-trainer.db';
const ARCHIVE_FOLDER = 'TKD-Trainer-Archive';

type TokenClient = { requestAccessToken: (opts?: { prompt?: string }) => void };
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string; scope: string; callback: (resp: { access_token: string; error?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, cb?: () => void) => void;
        };
      };
    };
  }
}

let accessToken: string | null = null;
let tokenExpiresAt = 0;
let tokenClient: TokenClient | null = null;
let clientIdInUse: string | null = null;
let pendingResolve: ((t: string) => void) | null = null;
let pendingReject: ((e: Error) => void) | null = null;

async function loadGis(): Promise<void> {
  if (window.google?.accounts) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('GIS Script konnte nicht geladen werden'));
    document.head.appendChild(s);
  });
}

function ensureTokenClient(clientId: string) {
  if (tokenClient && clientIdInUse === clientId) return;
  if (!window.google) throw new Error('Google Identity Services nicht geladen');
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: (resp) => {
      if (resp.error || !resp.access_token) {
        pendingReject?.(new Error(resp.error ?? 'Kein Token erhalten'));
      } else {
        accessToken = resp.access_token;
        tokenExpiresAt = Date.now() + 55 * 60 * 1000;
        pendingResolve?.(resp.access_token);
      }
      pendingResolve = null; pendingReject = null;
    }
  });
  clientIdInUse = clientId;
}

export function getDriveClientId(): string | null {
  return settingsRepo.get('drive.clientId');
}
export function setDriveClientId(id: string): void {
  settingsRepo.set('drive.clientId', id.trim());
}

export async function connectDrive(interactive = true): Promise<string> {
  const clientId = getDriveClientId();
  if (!clientId) throw new Error('Kein Google OAuth Client-ID konfiguriert (Einstellungen → Cloud-Sync)');
  await loadGis();
  ensureTokenClient(clientId);
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  return new Promise<string>((resolve, reject) => {
    pendingResolve = resolve; pendingReject = reject;
    tokenClient!.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

export function isDriveConnected(): boolean {
  return !!accessToken && Date.now() < tokenExpiresAt;
}

export function disconnectDrive(): void {
  if (accessToken) window.google?.accounts.oauth2.revoke(accessToken);
  accessToken = null; tokenExpiresAt = 0;
}

async function driveFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await connectDrive(false).catch(() => connectDrive(true));
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API ${res.status}: ${body}`);
  }
  return res;
}

async function findFile(name: string, parentId?: string): Promise<{ id: string; modifiedTime: string } | null> {
  const esc = name.replace(/'/g, "\\'");
  const q = parentId ? `name='${esc}' and '${parentId}' in parents and trashed=false` : `name='${esc}' and trashed=false`;
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,modifiedTime,name)`);
  const json = await res.json() as { files?: Array<{ id: string; modifiedTime: string }> };
  return json.files?.[0] ?? null;
}

async function findOrCreateFolder(name: string): Promise<string> {
  const cached = settingsRepo.get('drive.archiveFolderId');
  if (cached) return cached;
  const existing = await findFile(name);
  if (existing) { settingsRepo.set('drive.archiveFolderId', existing.id); return existing.id; }
  const res = await driveFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
  });
  const j = await res.json() as { id: string };
  settingsRepo.set('drive.archiveFolderId', j.id);
  return j.id;
}

async function uploadMultipart(name: string, bytes: Uint8Array, existingFileId?: string, parentId?: string): Promise<string> {
  const boundary = '-------tkd-' + Math.random().toString(36).slice(2);
  const metadata: Record<string, unknown> = { name };
  if (!existingFileId && parentId) metadata.parents = [parentId];
  const enc = new TextEncoder();
  const pre = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const post = enc.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(pre.length + bytes.length + post.length);
  body.set(pre, 0); body.set(bytes, pre.length); body.set(post, pre.length + bytes.length);
  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,modifiedTime`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime`;
  const res = await driveFetch(url, { method: existingFileId ? 'PATCH' : 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
  const j = await res.json() as { id: string };
  return j.id;
}

export async function uploadDbToDrive(): Promise<{ fileId: string; at: string }> {
  const bytes = exportDbBytes();
  const existing = await findFile(DB_FILENAME);
  const fileId = await uploadMultipart(DB_FILENAME, bytes, existing?.id);
  const at = nowIso();
  settingsRepo.set('drive.lastUploadAt', at);
  settingsRepo.set('drive.fileId', fileId);
  return { fileId, at };
}

export async function downloadDbFromDrive(): Promise<boolean> {
  const existing = await findFile(DB_FILENAME);
  if (!existing) return false;
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`);
  const buf = await res.arrayBuffer();
  await replaceDb(new Uint8Array(buf));
  settingsRepo.set('drive.lastDownloadAt', nowIso());
  return true;
}

export async function runDailyArchive(): Promise<{ created: boolean; fileName?: string }> {
  const today = todayIso();
  const lastArchive = settingsRepo.get('drive.lastArchiveDate');
  if (lastArchive === today) return { created: false };
  const folderId = await findOrCreateFolder(ARCHIVE_FOLDER);
  const name = `taekwondo-trainer-${today}.db`;
  const bytes = exportDbBytes();
  await uploadMultipart(name, bytes, undefined, folderId);
  settingsRepo.set('drive.lastArchiveDate', today);
  await pruneOldArchives(folderId, 30, 7);
  return { created: true, fileName: name };
}

async function pruneOldArchives(folderId: string, keepDays: number, keepMin: number): Promise<void> {
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,createdTime)&orderBy=createdTime desc`
  );
  const j = await res.json() as { files: Array<{ id: string; name: string; createdTime: string }> };
  const cutoff = Date.now() - keepDays * 86400000;
  const toDelete = j.files.slice(keepMin).filter((f) => new Date(f.createdTime).getTime() < cutoff);
  for (const f of toDelete) {
    await driveFetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, { method: 'DELETE' });
  }
}
