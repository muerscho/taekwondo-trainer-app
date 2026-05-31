import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { C, RADII, GROUP_LEVELS } from '@/design/tokens';
import { useData, focusAreasRepo, beltRanksRepo, groupsRepo, trainersRepo } from '@/state/dataStore';
import { useAuth } from '@/features/auth/authStore';
import { toast } from '@/state/uiStore';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import type { GroupLevel } from '@/domain/types';

type Tab = 'schwerpunkte' | 'gurtgrade' | 'gruppen' | 'trainer' | 'konto';

export default function EinstellungenPage() {
  const [tab, setTab] = useState<Tab>('schwerpunkte');
  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <TabBar<Tab>
        tabs={[
          { id: 'schwerpunkte', label: 'Schwerpunkte' },
          { id: 'gurtgrade', label: 'Gurtgrade' },
          { id: 'gruppen', label: 'Gruppen' },
          { id: 'trainer', label: 'Trainer' },
          { id: 'konto', label: 'Konto' }
        ]}
        active={tab} onChange={setTab}
      />
      {tab === 'schwerpunkte' && <Schwerpunkte />}
      {tab === 'gurtgrade' && <Gurtgrade />}
      {tab === 'gruppen' && <Gruppen />}
      {tab === 'trainer' && <Trainer />}
      {tab === 'konto' && <Konto />}
    </div>
  );
}

function Konto() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  return (
    <Card>
      <h3 style={{ margin: '0 0 10px' }}>Konto</h3>
      <p style={{ margin: '0 0 6px', fontSize: 13 }}>Angemeldet als <strong>{user?.email ?? '—'}</strong></p>
      <p style={{ margin: '0 0 14px', color: C.textMuted, fontSize: 12 }}>
        Alle Daten werden in der gemeinsamen Supabase-Datenbank gespeichert. Jeder angemeldete Trainer sieht und bearbeitet denselben Datenbestand.
      </p>
      <button onClick={() => { void signOut(); }} style={{ padding: '8px 14px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: RADII.sm }}>Abmelden</button>
    </Card>
  );
}

function Trainer() {
  const { trainers, reload } = useData();
  const [list, setList] = useState(trainers);
  const update = (i: number, patch: any) => setList((prev) => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  const add = () => setList([...list, { id: 'new-' + list.length + '-' + Math.round(performance.now()), name: 'Neuer Trainer', role: null, colorHex: '#1e3a5f', active: true, sortOrder: list.length, createdAt: '', updatedAt: '' }]);
  const removeLocal = async (idx: number) => {
    const t = list[idx];
    if (!t.id.startsWith('new-')) {
      if (!(await confirmDialog({ title: 'Trainer löschen?', body: 'Der Trainer wird entfernt. Bestehende Zuweisungen zu Einheiten gehen verloren.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
      await trainersRepo.remove(t.id);
    }
    setList(list.filter((_, i) => i !== idx));
    await reload('trainers');
  };
  const save = async () => {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      await trainersRepo.upsert({ id: t.id.startsWith('new-') ? undefined : t.id, name: t.name, role: t.role, colorHex: t.colorHex, active: t.active, sortOrder: i });
    }
    toast('Trainer gespeichert');
  };
  return (
    <Card>
      <p style={{ margin: '0 0 12px', color: C.textMuted, fontSize: 12 }}>
        Trainer können jeder Trainingseinheit zugeordnet werden (Anwesenheitserfassung → 🧑‍🏫 Trainer). Deaktivierte Trainer werden ausgeblendet, bestehende Zuweisungen bleiben erhalten.
      </p>
      {list.length === 0 && <div style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>Noch keine Trainer angelegt.</div>}
      {list.map((t, i) => (
        <div key={t.id} style={{ padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <input type="color" value={t.colorHex ?? '#1e3a5f'} onChange={(e) => update(i, { colorHex: e.target.value })} style={{ width: 36, height: 36, border: 'none', cursor: 'pointer' }} aria-label="Farbe" />
            <input style={{ ...inputStyle, flex: 1 }} value={t.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Name" />
          </div>
          <Field label="Rolle (optional)"><input style={inputStyle} value={t.role ?? ''} onChange={(e) => update(i, { role: e.target.value || null })} placeholder="z. B. Cheftrainer, Assistenz" /></Field>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
              <input type="checkbox" checked={t.active} onChange={(e) => update(i, { active: e.target.checked })} />
              Aktiv
            </label>
            <button onClick={() => removeLocal(i)} style={{ background: 'transparent', color: C.danger, border: 'none' }}>🗑 Trainer entfernen</button>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={add} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>+ Trainer</button>
        <button onClick={save} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
      </div>
    </Card>
  );
}

function Schwerpunkte() {
  const { focusAreas } = useData();
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
            <button onClick={async () => {
              await focusAreasRepo.remove(f.id);
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
        <button onClick={async () => {
          for (let i = 0; i < list.length; i++) {
            const f = list[i];
            await focusAreasRepo.upsert({ id: f.id.startsWith('new-') ? undefined : f.id, name: f.name, colorHex: f.colorHex, weightPercent: f.weightPercent, sortOrder: i, isMain: f.isMain });
          }
          toast('Gespeichert');
        }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
      </div>
    </Card>
  );
}

function Gurtgrade() {
  const { beltRanks } = useData();
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
      {edit && <BeltEditDialog id={edit} onClose={() => setEdit(null)} />}
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
          <button onClick={async () => {
            await beltRanksRepo.upsert({ id: belt.id, label, colorName, colorHex: bg, colorBorderHex: border, textColorHex: text || null, sortOrder: belt.sortOrder, isDan: belt.isDan });
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
            try { await groupsRepo.remove(g.id); setList(list.filter((x) => x.id !== g.id)); toast('Gruppe gelöscht'); }
            catch { toast('Gruppe ist in Verwendung', 'error'); }
          }} style={{ background: 'transparent', color: C.danger, border: 'none' }}>🗑 Gruppe löschen</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setList([...list, { id: 'new-' + list.length, name: 'Neue Gruppe', level: 'Einsteiger', minAge: 0, maxAge: 99, sortOrder: list.length, createdAt: '', updatedAt: '' }])} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>+ Gruppe</button>
        <button onClick={async () => {
          for (let i = 0; i < list.length; i++) {
            const g = list[i];
            await groupsRepo.upsert({ id: g.id.startsWith('new-') ? undefined : g.id, name: g.name, level: g.level, minAge: g.minAge, maxAge: g.maxAge, sortOrder: i });
          }
          await reload('groups'); toast('Gespeichert');
        }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, marginLeft: 'auto' }}>Speichern</button>
      </div>
    </Card>
  );
}
