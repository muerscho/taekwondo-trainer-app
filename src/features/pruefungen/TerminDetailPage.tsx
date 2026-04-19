import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { DirtyFlagSaveButton } from '@/components/ui/DirtyFlagSaveButton';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { C, RADII, PHASE_DURATIONS } from '@/design/tokens';
import { useData, termineRepo, statsRepo } from '@/state/dataStore';
import { formatDate, daysUntil } from '@/domain/derivations';
import { toast } from '@/state/uiStore';

type Tab = 'uebersicht' | 'phasen' | 'athleten' | 'kriterien';

export default function TerminDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { termine, reload } = useData();
  const termin = termine.find((t) => t.id === id);
  const [tab, setTab] = useState<Tab>('uebersicht');

  if (!termin) return <div style={{ padding: 30, textAlign: 'center' }}>Termin nicht gefunden · <Link to="/pruefungen">Zurück</Link></div>;

  const tage = daysUntil(termin.date);
  const ready = statsRepo.terminReadiness(termin.id);
  const ath = termineRepo.assignees(termin.id).length;
  const phasenTotal = termineRepo.phases(termin.id).reduce((s, p) => s + p.durationWeeks, 0);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/pruefungen" style={{ color: C.textMuted, textDecoration: 'none' }}>← Termine</Link>
      <Card style={{ marginTop: 8, borderLeft: `4px solid ${termin.type === 'Pruefung' ? C.exam : C.competition}` }}>
        <div style={{ fontSize: 11, color: C.textMuted }}>{termin.type === 'Pruefung' ? '🎓 Prüfung' : '🏅 Wettkampf'}</div>
        <h2 style={{ margin: '4px 0' }}>{termin.label}</h2>
        <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(termin.date, { weekday: true })} · {termin.location ?? 'Ort offen'}</div>
      </Card>
      <div style={{ marginTop: 12 }}>
        <TabBar<Tab>
          tabs={[{ id: 'uebersicht', label: 'Übersicht' }, { id: 'phasen', label: 'Phasenplan' }, { id: 'athleten', label: 'Athleten' }, { id: 'kriterien', label: 'Kriterien' }]}
          active={tab} onChange={setTab}
        />
      </div>
      {tab === 'uebersicht' && <TabUebersicht terminId={termin.id} tage={tage} ready={ready} ath={ath} phasenTotal={phasenTotal} onDelete={async () => {
        if (!(await confirmDialog({ title: 'Termin löschen?', body: 'Alle Phasen, Kriterien und Zuordnungen werden entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
        termineRepo.remove(termin.id); reload('termine'); nav('/pruefungen');
      }} />}
      {tab === 'phasen' && <TabPhasen terminId={termin.id} />}
      {tab === 'athleten' && <TabAthleten terminId={termin.id} terminType={termin.type} />}
      {tab === 'kriterien' && <TabKriterien terminId={termin.id} />}
    </div>
  );
}

function TabUebersicht({ terminId, tage, ready, ath, phasenTotal, onDelete }: { terminId: string; tage: number; ready: { pct: number }; ath: number; phasenTotal: number; onDelete: () => void }) {
  const { termine, reload } = useData();
  const termin = termine.find((t) => t.id === terminId)!;
  const [label, setLabel] = useState(termin.label);
  const [date, setDate] = useState(termin.date);
  const [location, setLocation] = useState(termin.location ?? '');
  const [examiner, setExaminer] = useState(termin.examinerName ?? '');
  const [description, setDescription] = useState(termin.description ?? '');
  const [notes, setNotes] = useState(termin.notes ?? '');
  const isDirty = label !== termin.label || date !== termin.date || location !== (termin.location ?? '') || examiner !== (termin.examinerName ?? '') || description !== (termin.description ?? '') || notes !== (termin.notes ?? '');
  return (
    <>
      <KPIBanner items={[
        { label: 'Tage', value: tage >= 0 ? tage : '—' },
        { label: 'Wochen Plan', value: phasenTotal },
        { label: 'Athleten', value: ath },
        { label: 'Kriterien', value: ready.pct + '%', color: ready.pct >= 75 ? C.success : ready.pct >= 50 ? C.warn : C.danger }
      ]} />
      <Card>
        <Field label="Bezeichnung"><input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
        <Field label="Datum"><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Ort"><input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
        {termin.type === 'Pruefung' && <Field label="Prüfer"><input style={inputStyle} value={examiner} onChange={(e) => setExaminer(e.target.value)} /></Field>}
        <Field label="Beschreibung"><textarea style={{ ...inputStyle, minHeight: 60 }} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Field label="Notizen"><textarea style={{ ...inputStyle, minHeight: 60 }} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <button onClick={onDelete} style={{ marginTop: 6, padding: '8px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: RADII.sm, fontSize: 12 }}>🗑 Termin löschen</button>
      </Card>
      <DirtyFlagSaveButton isDirty={isDirty} onSave={() => {
        termineRepo.upsert({ id: termin.id, type: termin.type, label, date, location: location || null, examinerName: examiner || null, description: description || null, notes: notes || null });
        reload('termine'); toast('Termin gespeichert');
      }} />
    </>
  );
}

function TabPhasen({ terminId }: { terminId: string }) {
  const [phases, setPhases] = useState(termineRepo.phases(terminId));
  const total = phases.reduce((s, p) => s + p.durationWeeks, 0);

  const save = () => {
    termineRepo.setPhases(terminId, phases.map((p) => ({ name: p.name, durationWeeks: p.durationWeeks, focusTopic: p.focusTopic })));
    toast('Phasen gespeichert');
  };
  const update = (i: number, patch: any) => setPhases((prev) => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  const addPhase = () => setPhases((prev) => [...prev, { id: 'new-' + prev.length, terminId, sortOrder: prev.length, name: 'Neue Phase', durationWeeks: 2, focusTopic: '' }]);
  const removePhase = (i: number) => { if (phases.length <= 1) return; setPhases((prev) => prev.filter((_, idx) => idx !== i)); };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Phasenplan ({total} Wochen)</h3>
        <button onClick={addPhase} style={{ padding: '6px 10px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontSize: 12 }}>+ Phase</button>
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', background: C.bg, marginBottom: 12 }}>
        {phases.map((p, i) => (
          <div key={i} title={p.name} style={{ width: `${total ? (p.durationWeeks / total) * 100 : 100 / phases.length}%`, background: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][i % 5] }} />
        ))}
      </div>
      {phases.map((p, i) => (
        <div key={i} style={{ padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 8 }}>
          <Field label="Name"><input style={inputStyle} value={p.name} onChange={(e) => update(i, { name: e.target.value })} /></Field>
          <Field label="Dauer">
            <select style={inputStyle} value={p.durationWeeks} onChange={(e) => update(i, { durationWeeks: Number(e.target.value) })}>
              {PHASE_DURATIONS.map((d) => <option key={d} value={d}>{d} Wochen</option>)}
            </select>
          </Field>
          <Field label="Fokus-Thema"><input style={inputStyle} value={p.focusTopic ?? ''} onChange={(e) => update(i, { focusTopic: e.target.value })} /></Field>
          {phases.length > 1 && <button onClick={() => removePhase(i)} style={{ background: 'transparent', color: C.danger, border: 'none' }}>🗑 Phase entfernen</button>}
        </div>
      ))}
      <button onClick={save} style={{ marginTop: 8, padding: '10px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>Phasen speichern</button>
    </Card>
  );
}

function TabAthleten({ terminId, terminType }: { terminId: string; terminType: string }) {
  const { athletes, groups, beltRanks } = useData();
  const [refreshKey, setRefresh] = useState(0); void refreshKey;
  const assignees = termineRepo.assignees(terminId);
  return (
    <Card>
      <h3 style={{ margin: '0 0 10px' }}>Zuweisung ({assignees.length})</h3>
      {athletes.map((a) => {
        const belt = beltRanks.find((b) => b.id === a.beltRankId);
        const group = groups.find((g) => g.id === a.groupId);
        const assigned = assignees.some((x) => x.athleteId === a.id);
        return (
          <div key={a.id} onClick={() => { termineRepo.toggleAssignee(terminId, a.id); setRefresh((x) => x + 1); }} style={{ padding: 10, marginBottom: 6, borderRadius: RADII.md, background: assigned ? (terminType === 'Pruefung' ? C.exam : C.competition) + '12' : C.bg, border: assigned ? `2px solid ${terminType === 'Pruefung' ? C.exam : C.competition}` : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BeltBadge belt={belt} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{group?.name}</div>
            </div>
            {assigned && <Badge bg={terminType === 'Pruefung' ? C.exam : C.competition} fg="#fff">Angemeldet</Badge>}
          </div>
        );
      })}
    </Card>
  );
}

function TabKriterien({ terminId }: { terminId: string }) {
  const [crit, setCrit] = useState(termineRepo.criteria(terminId));
  const [txt, setTxt] = useState('');
  const refresh = () => setCrit(termineRepo.criteria(terminId));
  const total = crit.length;
  const done = crit.filter((c) => c.fulfilled).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Card>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{done} / {total} erfüllt · Bereitschaft {pct}%</div>
        <ProgressBar value={pct} color={pct >= 75 ? C.success : pct >= 50 ? C.warn : C.danger} />
      </div>
      {crit.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, marginBottom: 6, background: C.bg, borderRadius: RADII.md }}>
          <button onClick={() => { termineRepo.toggleCriterion(c.id); refresh(); }} style={{ background: 'transparent', border: `2px solid ${c.fulfilled ? C.success : C.border}`, width: 22, height: 22, borderRadius: 999, color: C.success }}>{c.fulfilled ? '✓' : ''}</button>
          <span style={{ flex: 1, textDecoration: c.fulfilled ? 'line-through' : 'none', color: c.fulfilled ? C.textMuted : C.text }}>{c.text}</span>
          <button onClick={() => { termineRepo.removeCriterion(c.id); refresh(); }} style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input placeholder="Neues Kriterium …" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => {
          if (e.key === 'Enter' && txt.trim()) { termineRepo.addCriterion(terminId, txt.trim()); setTxt(''); refresh(); }
        }} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (txt.trim()) { termineRepo.addCriterion(terminId, txt.trim()); setTxt(''); refresh(); } }} style={{ padding: '0 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+</button>
      </div>
    </Card>
  );
}
