import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { Field, inputStyle } from '@/components/ui/Field';
import { C, RADII } from '@/design/tokens';
import { useData, unitsRepo, attendanceRepo, trainersRepo } from '@/state/dataStore';
import { formatDate } from '@/domain/derivations';
import { toast } from '@/state/uiStore';

export default function ErfassungsPage() {
  const { id } = useParams();
  const { athletes, groups, beltRanks, trainers } = useData();
  const unit = unitsRepo.get(id!);
  const [records, setRecords] = useState(() => unit ? attendanceRepo.byUnit(unit.id) : []);
  const [trainerAssignments, setTrainerAssignments] = useState(() => unit ? trainersRepo.byUnit(unit.id) : []);
  const [groupFilter, setGroupFilter] = useState(unit?.groupId ?? '');
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  if (!unit) return <div style={{ padding: 30, textAlign: 'center' }}>Einheit nicht gefunden · <Link to="/anwesenheit">Zurück</Link></div>;

  const group = groups.find((g) => g.id === unit.groupId);

  const visibleAthletes = useMemo(() => {
    let base = showAll ? athletes : athletes.filter((a) => !groupFilter || a.groupId === groupFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter((a) => a.name.toLowerCase().includes(q));
    }
    const primary = new Set(athletes.filter((a) => a.groupId === unit.groupId).map((a) => a.id));
    return [...base].sort((a, b) => {
      const ap = primary.has(a.id) ? 0 : 1;
      const bp = primary.has(b.id) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name);
    });
  }, [athletes, showAll, groupFilter, search, unit.groupId]);

  const getStatus = (aid: string) => records.find((r) => r.athleteId === aid)?.present ?? null;
  const setStatus = (aid: string, p: boolean | null) => {
    attendanceRepo.set(unit.id, aid, p);
    setRecords(attendanceRepo.byUnit(unit.id));
  };
  const present = records.filter((r) => r.present === true).length;
  const absent = records.filter((r) => r.present === false).length;
  const total = present + absent;
  const quote = total ? Math.round((present / total) * 100) : 0;

  const allPresent = () => { visibleAthletes.forEach((a) => attendanceRepo.set(unit.id, a.id, true)); setRecords(attendanceRepo.byUnit(unit.id)); toast('Alle sichtbaren als anwesend markiert'); };
  const allAbsent = () => { visibleAthletes.forEach((a) => attendanceRepo.set(unit.id, a.id, false)); setRecords(attendanceRepo.byUnit(unit.id)); toast('Alle sichtbaren als abwesend markiert'); };

  const toggleTrainer = (trainerId: string) => {
    trainersRepo.toggleAssignment(unit.id, trainerId);
    setTrainerAssignments(trainersRepo.byUnit(unit.id));
  };
  const isTrainerAssigned = (tid: string) => trainerAssignments.some((a) => a.trainerId === tid);
  const activeTrainers = trainers.filter((t) => t.active);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/anwesenheit" style={{ color: C.textMuted, textDecoration: 'none' }}>← Anwesenheit</Link>
      <Card style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0 }}>{formatDate(unit.date, { weekday: true })}</h2>
        <div style={{ fontSize: 12, color: C.textMuted }}>{group?.name} · {unit.durationMinutes} min</div>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>🧑‍🏫 Trainer</h3>
        {activeTrainers.length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: 13 }}>
            Noch keine Trainer angelegt. <Link to="/einstellungen" style={{ color: C.primary }}>Einstellungen → Trainer</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {activeTrainers.map((t) => {
              const on = isTrainerAssigned(t.id);
              const color = t.colorHex ?? C.primary;
              return (
                <button key={t.id} onClick={() => toggleTrainer(t.id)} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: `2px solid ${on ? color : C.border}`,
                  background: on ? color + '22' : 'transparent',
                  color: on ? color : C.textMuted, cursor: 'pointer'
                }}>
                  {on ? '✓ ' : ''}{t.name}{t.role ? ` · ${t.role}` : ''}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 10 }}>
        <KPIBanner items={[
          { label: 'Anwesend', value: present, color: C.success },
          { label: 'Abwesend', value: absent, color: C.danger },
          { label: 'Quote', value: quote + '%', color: quote >= 80 ? C.success : quote >= 60 ? C.warn : C.danger }
        ]} />
      </div>

      <Card style={{ marginBottom: 10 }}>
        <Field label="Suche"><input style={inputStyle} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Athlet suchen …" /></Field>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Alle Athleten anzeigen (Gruppen-übergreifend)
          </label>
          {!showAll && (
            <select style={{ ...inputStyle, maxWidth: 200 }} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
              <option value="">Alle Gruppen</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={allPresent} style={{ padding: '8px 12px', background: C.success + '22', color: C.success, border: 'none', borderRadius: RADII.sm, flex: 1 }}>Alle anwesend</button>
        <button onClick={allAbsent} style={{ padding: '8px 12px', background: C.danger + '22', color: C.danger, border: 'none', borderRadius: RADII.sm, flex: 1 }}>Alle abwesend</button>
      </div>

      {visibleAthletes.length === 0 ? (
        <Card><div style={{ color: C.textMuted, textAlign: 'center' }}>Keine Athleten passen zum Filter.</div></Card>
      ) : visibleAthletes.map((a) => {
        const st = getStatus(a.id);
        const belt = beltRanks.find((b) => b.id === a.beltRankId);
        const bg = st === true ? C.success + '22' : st === false ? C.danger + '22' : C.bg;
        const next = st === null ? true : st === true ? false : null;
        const isPrimary = a.groupId === unit.groupId;
        const grp = groups.find((g) => g.id === a.groupId);
        return (
          <div key={a.id} onClick={() => setStatus(a.id, next)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: bg, borderRadius: RADII.md, marginBottom: 6, cursor: 'pointer', opacity: isPrimary ? 1 : 0.85 }}>
            <BeltBadge belt={belt} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
              {!isPrimary && <div style={{ fontSize: 10, color: C.textMuted }}>Gast · {grp?.name}</div>}
            </div>
            <Badge bg={st === true ? C.success : st === false ? C.danger : C.borderStrong} fg="#fff">{st === true ? '✓ Anwesend' : st === false ? '✗ Abwesend' : '· Offen'}</Badge>
          </div>
        );
      })}
    </div>
  );
}
