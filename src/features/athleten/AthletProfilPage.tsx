import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { Badge } from '@/components/ui/Badge';
import { Field, inputStyle } from '@/components/ui/Field';
import { DirtyFlagSaveButton } from '@/components/ui/DirtyFlagSaveButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { C, RADII, GRADING_EVALS } from '@/design/tokens';
import { useData, athletesRepo, goalsRepo, graduationRepo, termineRepo } from '@/state/dataStore';
import { ageYears, formatDate, todayIso } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import type { Athlete, GradingEval } from '@/domain/types';

type Tab = 'profil' | 'graduierung' | 'termine' | 'ziele';

export default function AthletProfilPage() {
  const { id } = useParams();
  const { athletes, groups, beltRanks, termine, reload } = useData();
  const athlete = athletes.find((a) => a.id === id);
  const [tab, setTab] = useState<Tab>('profil');

  if (!athlete) return <div style={{ padding: 30, textAlign: 'center' }}>Athlet nicht gefunden · <Link to="/athleten">Zurück</Link></div>;

  const belt = beltRanks.find((b) => b.id === athlete.beltRankId);
  const group = groups.find((g) => g.id === athlete.groupId);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/athleten" style={{ color: C.textMuted, textDecoration: 'none' }}>← Athleten</Link>
      <Card style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 999, background: belt?.colorHex, border: `3px solid ${belt?.colorBorderHex}`, color: belt?.textColorHex ?? '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
            {athlete.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{athlete.name}</h2>
            <div style={{ fontSize: 12, color: C.textMuted }}>{ageYears(athlete.birthDate)} Jahre · {group?.name}</div>
            <div style={{ marginTop: 4 }}><BeltBadge belt={belt} /></div>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 12 }}>
        <TabBar<Tab>
          tabs={[
            { id: 'profil', label: 'Profil' },
            { id: 'graduierung', label: 'Graduierung' },
            { id: 'termine', label: 'Termine' },
            { id: 'ziele', label: 'Ziele' }
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'profil' && <TabProfil athlete={athlete} onSaved={() => reload('athletes')} />}
      {tab === 'graduierung' && <TabGraduierung athleteId={athlete.id} currentBeltId={athlete.beltRankId} onChange={() => reload('athletes')} />}
      {tab === 'termine' && <TabTermine athleteId={athlete.id} termine={termine} />}
      {tab === 'ziele' && <TabZiele athleteId={athlete.id} />}
    </div>
  );
}

function TabProfil({ athlete, onSaved }: { athlete: Athlete; onSaved: () => void }) {
  const { groups, beltRanks } = useData();
  const [name, setName] = useState(athlete.name);
  const [birth, setBirth] = useState(athlete.birthDate);
  const [groupId, setGroupId] = useState(athlete.groupId);
  const [beltId, setBeltId] = useState(athlete.beltRankId);
  const [note, setNote] = useState(athlete.trainerNote ?? '');

  const isDirty = name !== athlete.name || birth !== athlete.birthDate || groupId !== athlete.groupId || beltId !== athlete.beltRankId || note !== (athlete.trainerNote ?? '');

  const nextBeltIndex = beltRanks.findIndex((b) => b.id === beltId) + 1;
  const nextBelt = nextBeltIndex > 0 && nextBeltIndex < beltRanks.length ? beltRanks[nextBeltIndex] : null;

  return (
    <Card>
      <Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Geburtsdatum"><input type="date" style={inputStyle} value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
      <Field label="Alter (automatisch)"><input disabled style={{ ...inputStyle, background: C.bg }} value={`${ageYears(birth)} Jahre`} /></Field>
      <Field label="Gruppe">
        <select style={inputStyle} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </Field>
      <Field label="Gurtgrad">
        <select style={inputStyle} value={beltId} onChange={(e) => setBeltId(e.target.value)}>
          {beltRanks.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </Field>
      {nextBelt && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Nächste Graduierung: {beltRanks.find((b) => b.id === beltId)?.label} → {nextBelt.label}</div>}
      <Field label="Trainer-Notiz"><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={note} onChange={(e) => setNote(e.target.value)} /></Field>

      <DirtyFlagSaveButton isDirty={isDirty} onSave={() => {
        athletesRepo.upsert({ id: athlete.id, name, birthDate: birth, groupId, beltRankId: beltId, trainerNote: note || null });
        toast('Profil gespeichert');
        onSaved();
      }} />
    </Card>
  );
}

function TabGraduierung({ athleteId, currentBeltId, onChange }: { athleteId: string; currentBeltId: string; onChange: () => void }) {
  const { beltRanks } = useData();
  const [history, setHistory] = useState(graduationRepo.byAthlete(athleteId));
  const [date, setDate] = useState(todayIso());
  const [toBelt, setToBelt] = useState('');
  const [evaluation, setEvaluation] = useState<GradingEval>('Bestanden');
  const currentIdx = beltRanks.findIndex((b) => b.id === currentBeltId);
  const nextBelt = currentIdx >= 0 ? beltRanks[currentIdx + 1] : null;

  useEffect(() => { if (nextBelt && !toBelt) setToBelt(nextBelt.id); }, [nextBelt]);

  const add = () => {
    if (!toBelt) return;
    graduationRepo.add({ athleteId, date, fromBeltRankId: currentBeltId, toBeltRankId: toBelt, evaluation });
    setHistory(graduationRepo.byAthlete(athleteId));
    onChange();
    toast('Graduierung eingetragen');
  };

  const remove = async (id: string) => {
    if (!(await confirmDialog({ title: 'Graduierung löschen?', body: 'Der Eintrag wird dauerhaft entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
    graduationRepo.remove(id);
    setHistory(graduationRepo.byAthlete(athleteId));
    onChange();
  };

  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 10px' }}>Neue Graduierung eintragen</h3>
        <Field label="Datum"><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Zielgurtgrad">
          <select style={inputStyle} value={toBelt} onChange={(e) => setToBelt(e.target.value)}>
            {beltRanks.filter((b) => b.id !== currentBeltId).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="Bewertung">
          <select style={inputStyle} value={evaluation} onChange={(e) => setEvaluation(e.target.value as GradingEval)}>
            {GRADING_EVALS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <button onClick={add} style={{ padding: '10px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>Eintragen</button>
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>Verlauf</h3>
        {history.length === 0 ? <div style={{ color: C.textMuted }}>Noch keine Einträge.</div> : history.map((h) => {
          const from = beltRanks.find((b) => b.id === h.fromBeltRankId);
          const to = beltRanks.find((b) => b.id === h.toBeltRankId);
          return (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(h.date)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <BeltBadge belt={from} size="sm" /> → <BeltBadge belt={to} size="sm" />
                  <Badge bg={h.evaluation === 'Nicht bestanden' ? C.danger + '22' : C.success + '22'} fg={h.evaluation === 'Nicht bestanden' ? C.danger : C.success}>{h.evaluation}</Badge>
                </div>
              </div>
              <button onClick={() => remove(h.id)} aria-label="Löschen" style={{ background: 'transparent', border: 'none', color: C.danger, fontSize: 16 }}>🗑</button>
            </div>
          );
        })}
      </Card>
    </>
  );
}

function TabTermine({ athleteId, termine }: { athleteId: string; termine: any[] }) {
  const [assignments, setAssignments] = useState(() => termineRepo.list().filter(() => true).map((t) => ({ t, assigned: termineRepo.assignees(t.id).some((a) => a.athleteId === athleteId) })));

  const refresh = () => setAssignments(termineRepo.list().map((t) => ({ t, assigned: termineRepo.assignees(t.id).some((a) => a.athleteId === athleteId) })));
  const toggle = (terminId: string) => { termineRepo.toggleAssignee(terminId, athleteId); refresh(); };

  if (termine.length === 0) return <Card><div style={{ color: C.textMuted }}>Noch keine Termine angelegt.</div></Card>;

  return (
    <Card>
      <h3 style={{ margin: '0 0 10px' }}>Zuweisung zu Terminen</h3>
      {assignments.map(({ t, assigned }) => (
        <div key={t.id} onClick={() => toggle(t.id)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 10, marginBottom: 6, background: assigned ? C.primary + '12' : C.bg,
          borderRadius: RADII.md, cursor: 'pointer',
          border: assigned ? `2px solid ${C.primary}` : '2px solid transparent'
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>{t.type === 'Pruefung' ? '🎓' : '🏅'} {t.label}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{formatDate(t.date, { weekday: true })}</div>
          </div>
          <div style={{ fontSize: 20 }}>{assigned ? '✓' : '○'}</div>
        </div>
      ))}
    </Card>
  );
}

function TabZiele({ athleteId }: { athleteId: string }) {
  const [goals, setGoals] = useState(goalsRepo.byAthlete(athleteId));
  const [txt, setTxt] = useState('');
  const refresh = () => setGoals(goalsRepo.byAthlete(athleteId));
  const total = goals.length;
  const done = goals.filter((g) => g.achieved).length;

  return (
    <Card>
      <h3 style={{ margin: '0 0 8px' }}>Ziele</h3>
      {total > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{done} / {total} erreicht</div>
          <ProgressBar value={total ? (done / total) * 100 : 0} color={C.success} />
        </div>
      )}
      {goals.map((g) => (
        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, marginBottom: 6, background: C.bg, borderRadius: RADII.md }}>
          <button onClick={() => { goalsRepo.toggle(g.id); refresh(); }} style={{ background: 'transparent', border: `2px solid ${g.achieved ? C.success : C.border}`, width: 22, height: 22, borderRadius: 999, color: C.success, fontSize: 14 }}>{g.achieved ? '✓' : ''}</button>
          <span style={{ flex: 1, textDecoration: g.achieved ? 'line-through' : 'none', color: g.achieved ? C.textMuted : C.text }}>{g.text}</span>
          <button aria-label="Löschen" onClick={() => { goalsRepo.remove(g.id); refresh(); }} style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input placeholder="Neues Ziel …" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => {
          if (e.key === 'Enter' && txt.trim()) { goalsRepo.add(athleteId, txt.trim()); setTxt(''); refresh(); }
        }} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (txt.trim()) { goalsRepo.add(athleteId, txt.trim()); setTxt(''); refresh(); } }} style={{ padding: '0 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+</button>
      </div>
    </Card>
  );
}
