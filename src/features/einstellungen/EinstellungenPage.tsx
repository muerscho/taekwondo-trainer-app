import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { C, RADII, GROUP_LEVELS } from '@/design/tokens';
import { useData, focusAreasRepo, beltRanksRepo, groupsRepo, aiConfigRepo } from '@/state/dataStore';
import { encryptApiKey } from '@/security/keyStore';
import { buildProvider } from '@/ai/factory';
import { setDriveClientId, getDriveClientId, connectDrive, uploadDbToDrive, downloadDbFromDrive, runDailyArchive, disconnectDrive } from '@/storage/driveSync';
import { lastSyncInfo } from '@/storage/bootstrap';
import { toast } from '@/state/uiStore';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import type { AiFunctionId, AiProvider, GroupLevel } from '@/domain/types';

type Tab = 'schwerpunkte' | 'gurtgrade' | 'gruppen' | 'ki' | 'sync';

export default function EinstellungenPage() {
  const [tab, setTab] = useState<Tab>('schwerpunkte');
  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <TabBar<Tab>
        tabs={[
          { id: 'schwerpunkte', label: 'Schwerpunkte' },
          { id: 'gurtgrade', label: 'Gurtgrade' },
          { id: 'gruppen', label: 'Gruppen' },
          { id: 'ki', label: 'KI' },
          { id: 'sync', label: '☁ Cloud-Sync' }
        ]}
        active={tab} onChange={setTab}
      />
      {tab === 'schwerpunkte' && <Schwerpunkte />}
      {tab === 'gurtgrade' && <Gurtgrade />}
      {tab === 'gruppen' && <Gruppen />}
      {tab === 'ki' && <KI />}
      {tab === 'sync' && <Sync />}
    </div>
  );
}

function Schwerpunkte() {
  const { focusAreas, reload } = useData();
  const [list, setList] = useState(focusAreas);
  const sum = list.reduce((s, f) => s + f.weightPercent, 0);
  const over = sum > 100;
  const update = (i: number, patch: any) => setList((prev) => prev.map((f, idx) => idx === i ? { ...f, ...patch } : f));
  return (
    <Card>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span>Summe</span>
          <span style={{ fontWeight: 700, color: over ? C.danger : sum === 100 ? C.success : C.textMuted }}>{sum}% {sum < 100 && `· ${100 - sum}% frei`}</span>
        </div>
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: C.bg }}>
          {list.map((f) => <div key={f.id} style={{ width: `${f.weightPercent}%`, background: f.colorHex }} />)}
        </div>
      </div>
      {list.map((f, i) => (
        <div key={f.id} style={{ padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <input type="color" value={f.colorHex} onChange={(e) => update(i, { colorHex: e.target.value })} style={{ width: 36, height: 36, border: 'none' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={f.name} onChange={(e) => update(i, { name: e.target.value })} />
            <button onClick={() => {
              focusAreasRepo.remove(f.id); reload('focusAreas');
              setList(list.filter((x) => x.id !== f.id));
            }} style={{ background: 'transparent', color: C.danger, border: 'none' }}>🗑</button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="range" min={0} max={100} value={f.weightPercent} onChange={(e) => update(i, { weightPercent: Number(e.target.value) })} style={{ flex: 1 }} />
            <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'right' }}>{f.weightPercent}%</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={() => setList([...list, { id: 'new-' + list.length, name: 'Neu', colorHex: '#6b7280', weightPercent: 0, sortOrder: list.length, isMain: true, createdAt: '', updatedAt: '' }])} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>+ Schwerpunkt</button>
        <button onClick={() => {
          list.forEach((f, i) => focusAreasRepo.upsert({ id: f.id.startsWith('new-') ? undefined : f.id, name: f.name, colorHex: f.colorHex, weightPercent: f.weightPercent, sortOrder: i, isMain: f.isMain }));
          reload('focusAreas'); toast('Gespeichert');
        }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
      </div>
    </Card>
  );
}

function Gurtgrade() {
  const { beltRanks, reload } = useData();
  const [edit, setEdit] = useState<string | null>(null);
  return (
    <Card>
      {beltRanks.map((b) => (
        <div key={b.id} style={{ padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BeltBadge belt={b} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{b.colorName}</div>
          </div>
          <button onClick={() => setEdit(b.id)} style={{ background: 'transparent', border: 'none', color: C.primary }}>Bearbeiten</button>
        </div>
      ))}
      {edit && <BeltEditDialog id={edit} onClose={() => { setEdit(null); reload('beltRanks'); }} />}
    </Card>
  );
}

function BeltEditDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { beltRanks } = useData();
  const belt = beltRanks.find((b) => b.id === id);
  if (!belt) return null;
  const [label, setLabel] = useState(belt.label);
  const [colorName, setColorName] = useState(belt.colorName);
  const [bg, setBg] = useState(belt.colorHex);
  const [border, setBorder] = useState(belt.colorBorderHex);
  const [text, setText] = useState(belt.textColorHex ?? '');
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 400, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>Gurtgrad bearbeiten</h3>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 10 }}>
          <BeltBadge belt={{ ...belt, label, colorHex: bg, colorBorderHex: border, textColorHex: text || null, colorName }} />
        </div>
        <Field label="Bezeichnung"><input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
        <Field label="Farbname"><input style={inputStyle} value={colorName} onChange={(e) => setColorName(e.target.value)} /></Field>
        <Field label="Hintergrund"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 60, height: 40 }} /></Field>
        <Field label="Rahmen"><input type="color" value={border} onChange={(e) => setBorder(e.target.value)} style={{ width: 60, height: 40 }} /></Field>
        <Field label="Schriftfarbe (optional)"><input type="color" value={text || '#000000'} onChange={(e) => setText(e.target.value)} style={{ width: 60, height: 40 }} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button onClick={() => {
            beltRanksRepo.upsert({ id: belt.id, label, colorName, colorHex: bg, colorBorderHex: border, textColorHex: text || null, sortOrder: belt.sortOrder, isDan: belt.isDan });
            toast('Gurtgrad gespeichert'); onClose();
          }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Speichern</button>
        </div>
      </div>
    </div>
  );
}

function Gruppen() {
  const { groups, reload } = useData();
  const [list, setList] = useState(groups);
  const update = (i: number, patch: any) => setList((prev) => prev.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  return (
    <Card>
      {list.map((g, i) => (
        <div key={g.id} style={{ padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 8 }}>
          <Field label="Name"><input style={inputStyle} value={g.name} onChange={(e) => update(i, { name: e.target.value })} /></Field>
          <Field label="Level">
            <select style={inputStyle} value={g.level} onChange={(e) => update(i, { level: e.target.value as GroupLevel })}>
              {GROUP_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 6 }}>
            <Field label="Min Alter" style={{ flex: 1 }}><input type="number" style={inputStyle} value={g.minAge} onChange={(e) => update(i, { minAge: Number(e.target.value) })} /></Field>
            <Field label="Max Alter" style={{ flex: 1 }}><input type="number" style={inputStyle} value={g.maxAge} onChange={(e) => update(i, { maxAge: Number(e.target.value) })} /></Field>
          </div>
          <button onClick={async () => {
            if (!(await confirmDialog({ title: 'Gruppe löschen?', body: 'Falls Athleten zugewiesen sind, wird das Löschen abgelehnt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
            try { groupsRepo.remove(g.id); reload('groups'); setList(list.filter((x) => x.id !== g.id)); toast('Gruppe gelöscht'); }
            catch { toast('Gruppe ist in Verwendung', 'error'); }
          }} style={{ background: 'transparent', color: C.danger, border: 'none' }}>🗑 Gruppe löschen</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setList([...list, { id: 'new-' + list.length, name: 'Neue Gruppe', level: 'Einsteiger', minAge: 0, maxAge: 99, sortOrder: list.length, createdAt: '', updatedAt: '' }])} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>+ Gruppe</button>
        <button onClick={() => {
          list.forEach((g, i) => groupsRepo.upsert({ id: g.id.startsWith('new-') ? undefined : g.id, name: g.name, level: g.level, minAge: g.minAge, maxAge: g.maxAge, sortOrder: i }));
          reload('groups'); toast('Gespeichert');
        }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
      </div>
    </Card>
  );
}

function KI() {
  const { aiConfig, aiToggles, reload } = useData();
  const [provider, setProvider] = useState<AiProvider>(aiConfig?.provider ?? 'Claude');
  const [model, setModel] = useState(aiConfig?.model ?? 'claude-sonnet-4-6');
  const [apiKey, setApiKey] = useState('');
  const [customEp, setCustomEp] = useState(aiConfig?.customEndpointUrl ?? '');
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const models: Record<AiProvider, string[]> = {
    Claude: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    OpenAI: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
    Custom: ['custom-model']
  };

  const save = async () => {
    let cipher = aiConfig?.apiKeyCipher ?? null, iv = aiConfig?.apiKeyIv ?? null;
    if (apiKey) { const enc = await encryptApiKey(apiKey); cipher = enc.cipher; iv = enc.iv; }
    aiConfigRepo.update({ provider, model, apiKeyCipher: cipher, apiKeyIv: iv, customEndpointUrl: customEp || null });
    reload('aiConfig'); setApiKey(''); toast('Konfiguration gespeichert');
  };

  const test = async () => {
    setTesting(true); setTestResult(null);
    try {
      let tmp = aiConfig;
      if (apiKey) { const enc = await encryptApiKey(apiKey); aiConfigRepo.update({ provider, model, apiKeyCipher: enc.cipher, apiKeyIv: enc.iv, customEndpointUrl: customEp || null }); tmp = aiConfigRepo.get(); }
      const p = await buildProvider(tmp!);
      if (!p) throw new Error('Kein API-Key');
      const r = await p.testConnection();
      setTestResult({ ok: r.ok, msg: r.ok ? 'Verbindung erfolgreich' : (r.error ?? 'Fehler') });
      aiConfigRepo.update({ lastConnectionTestAt: new Date().toISOString(), lastConnectionTestStatus: r.ok ? 'success' : 'error', lastConnectionTestError: r.ok ? null : r.error ?? null });
      reload('aiConfig');
    } catch (e) { setTestResult({ ok: false, msg: (e as Error).message }); }
    finally { setTesting(false); }
  };

  const fnLabels: Record<AiFunctionId, string> = {
    einheit: 'Einheitsvorschläge', phasenplan: 'Phasenplan-Generierung', dashboard: 'Dashboard-Empfehlung',
    progress: 'Progressionsempfehlung', variation: 'Variationslogik', bibliothek: 'Bibliotheksvorschläge'
  };

  return (
    <>
      <Card>
        <Field label="Provider">
          <select style={inputStyle} value={provider} onChange={(e) => setProvider(e.target.value as AiProvider)}>
            <option>Claude</option><option>OpenAI</option><option>Custom</option>
          </select>
        </Field>
        <Field label="Modell">
          <select style={inputStyle} value={model} onChange={(e) => setModel(e.target.value)}>
            {models[provider].map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        {provider === 'Custom' && <Field label="Base-URL"><input style={inputStyle} value={customEp} onChange={(e) => setCustomEp(e.target.value)} placeholder="https://..." /></Field>}
        <Field label={apiKey || !aiConfig?.apiKeyCipher ? 'API-Key' : 'API-Key (gespeichert, zum Ändern neu eingeben)'} hint="🔒 Verschlüsselt auf diesem Gerät gespeichert, nie im Klartext übertragen.">
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} type={show ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={aiConfig?.apiKeyCipher ? '••••••••' : 'sk-...'} />
            <button onClick={() => setShow(!show)} aria-label="Sichtbarkeit" style={{ padding: '0 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>{show ? '🙈' : '👁'}</button>
          </div>
        </Field>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={test} disabled={testing} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>{testing ? '⏳ Teste …' : '🔌 Verbindung testen'}</button>
          <button onClick={save} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
        </div>
        {testResult && <div style={{ marginTop: 10, padding: 10, background: testResult.ok ? C.success + '22' : C.danger + '22', color: testResult.ok ? C.success : C.danger, borderRadius: RADII.sm, fontSize: 12 }}>{testResult.msg}</div>}
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>KI-Funktionen</h3>
        {aiToggles.map((t) => (
          <div key={t.functionId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13 }}>{fnLabels[t.functionId] ?? t.functionId}</span>
            <button onClick={() => { aiConfigRepo.setToggle(t.functionId, !t.enabled); reload('aiToggles'); }} style={{ width: 46, height: 26, borderRadius: 999, border: 'none', background: t.enabled ? C.success : C.borderStrong, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 2, left: t.enabled ? 22 : 2, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left 200ms' }} />
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}

function Sync() {
  const [clientId, setClientId] = useState(getDriveClientId() ?? '');
  const [busy, setBusy] = useState(false);
  const info = lastSyncInfo();

  const doSave = () => { setDriveClientId(clientId); toast('Client-ID gespeichert'); };
  const doConnect = async () => { setBusy(true); try { await connectDrive(true); toast('Verbunden'); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } };
  const doUpload = async () => { setBusy(true); try { await uploadDbToDrive(); toast('Sicherung hochgeladen'); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } };
  const doDownload = async () => {
    if (!(await confirmDialog({ title: 'Aus Google Drive laden?', body: 'Die lokale Datenbank wird durch die Drive-Version ersetzt.', tone: 'danger', confirmLabel: 'Laden' }))) return;
    setBusy(true); try { const ok = await downloadDbFromDrive(); toast(ok ? 'Geladen — Seite neu laden' : 'Keine Sicherung gefunden'); if (ok) setTimeout(() => location.reload(), 1000); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  };
  const doArchive = async () => { setBusy(true); try { const r = await runDailyArchive(); toast(r.created ? `Archiv angelegt: ${r.fileName}` : 'Archiv ist bereits aktuell'); } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); } };

  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 8px' }}>Google Drive verbinden</h3>
        <p style={{ margin: '0 0 10px', color: C.textMuted, fontSize: 12 }}>
          Die App speichert eine verschlüsselbare SQLite-Sicherung in deinem Google Drive (Scope: <code>drive.file</code>, nur App-Dateien). Für die OAuth-Verbindung wird eine Client-ID aus einem Google-Cloud-Projekt benötigt (siehe Installationsanleitung).
        </p>
        <Field label="Google OAuth Client-ID">
          <input style={inputStyle} value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="…apps.googleusercontent.com" />
        </Field>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={doSave} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>Client-ID speichern</button>
          <button onClick={doConnect} disabled={busy || !clientId} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>🔗 Verbinden</button>
          <button onClick={() => { disconnectDrive(); toast('Getrennt'); }} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>Trennen</button>
        </div>
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>Aktionen</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button disabled={busy} onClick={doUpload} style={{ padding: '8px 14px', background: C.success, color: '#fff', border: 'none', borderRadius: RADII.sm }}>⬆ Jetzt sichern</button>
          <button disabled={busy} onClick={doDownload} style={{ padding: '8px 14px', background: C.warn, color: '#fff', border: 'none', borderRadius: RADII.sm }}>⬇ Aus Drive laden</button>
          <button disabled={busy} onClick={doArchive} style={{ padding: '8px 14px', background: C.info, color: '#fff', border: 'none', borderRadius: RADII.sm }}>📦 Tagesarchiv anlegen</button>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted }}>
          <div>Letzter Upload: {info.lastUploadAt ?? '—'}</div>
          <div>Letzter Download: {info.lastDownloadAt ?? '—'}</div>
          <div>Letztes Tagesarchiv: {info.lastArchiveDate ?? '—'}</div>
          <div>Status: {info.connected ? <Badge bg={C.success + '22'} fg={C.success}>Verbunden</Badge> : <Badge bg={C.borderStrong + '44'} fg={C.textMuted}>Offline</Badge>}</div>
        </div>
      </Card>
    </>
  );
}
