import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import sqlJsWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema';
import { seedDefaults } from './seed';
import { nowIso } from '@/domain/derivations';

const DB_KEY = 'tkd-trainer-db';
const META_KEY = 'tkd-trainer-meta';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let dirty = false;
let persistQueued = false;

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  SQL = await initSqlJs({ locateFile: () => sqlJsWasmUrl });
  return SQL;
}

async function readBlobFromIdb(): Promise<Uint8Array | null> {
  try {
    const db = await openIdb();
    const tx = db.transaction('blobs', 'readonly');
    const store = tx.objectStore('blobs');
    return await new Promise<Uint8Array | null>((resolve, reject) => {
      const req = store.get(DB_KEY);
      req.onsuccess = () => resolve((req.result as Uint8Array) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function writeBlobToIdb(data: Uint8Array): Promise<void> {
  const db = await openIdb();
  const tx = db.transaction('blobs', 'readwrite');
  tx.objectStore('blobs').put(data, DB_KEY);
  tx.objectStore('blobs').put({ updatedAt: nowIso() }, META_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('tkd-trainer', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('blobs');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function initDb(): Promise<Database> {
  if (db) return db;
  const sql = await loadSqlJs();
  const existing = await readBlobFromIdb();
  db = existing ? new sql.Database(existing) : new sql.Database();
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA_SQL);
  const row = db.exec("SELECT schema_version FROM schema_meta WHERE id='default'");
  if (!row.length || !row[0].values.length) {
    db.run("INSERT INTO schema_meta(id, schema_version, applied_at) VALUES('default', ?, ?)", [SCHEMA_VERSION, nowIso()]);
    seedDefaults(db);
    await persistNow();
  }
  try {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().catch(() => {});
    }
  } catch {}
  return db;
}

export function getDb(): Database {
  if (!db) throw new Error('DB nicht initialisiert');
  return db;
}

export async function persistNow(): Promise<void> {
  if (!db) return;
  const bytes = db.export();
  await writeBlobToIdb(bytes);
  dirty = false;
}

export function markDirty(): void {
  dirty = true;
  schedulePersist();
}

function schedulePersist() {
  if (persistQueued) return;
  persistQueued = true;
  setTimeout(async () => {
    persistQueued = false;
    if (dirty) {
      try { await persistNow(); } catch (e) { console.error('persist failed', e); }
    }
  }, 500);
}

export function isDirty(): boolean {
  return dirty;
}

export function exportDbBytes(): Uint8Array {
  if (!db) throw new Error('DB nicht initialisiert');
  return db.export();
}

export async function replaceDb(bytes: Uint8Array): Promise<void> {
  const sql = await loadSqlJs();
  if (db) db.close();
  db = new sql.Database(bytes);
  db.exec('PRAGMA foreign_keys = ON;');
  await persistNow();
}

export function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const d = getDb();
  const res = d.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj as T;
  });
}

export function run(sql: string, params: unknown[] = []): void {
  getDb().run(sql, params);
  markDirty();
}

export function transaction<T>(fn: () => T): T {
  const d = getDb();
  d.run('BEGIN');
  try {
    const r = fn();
    d.run('COMMIT');
    markDirty();
    return r;
  } catch (e) {
    d.run('ROLLBACK');
    throw e;
  }
}

export function registerLifecycleHandlers(onHide?: () => void): void {
  const handler = () => {
    if (dirty) {
      void persistNow();
      onHide?.();
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') handler();
  });
  window.addEventListener('pagehide', handler);
  window.addEventListener('beforeunload', () => {
    if (dirty) {
      try {
        const bytes = db!.export();
        const ch = indexedDB.open('tkd-trainer', 1);
        ch.onsuccess = () => {
          const tx = ch.result.transaction('blobs', 'readwrite');
          tx.objectStore('blobs').put(bytes, DB_KEY);
        };
      } catch {}
    }
  });
}
