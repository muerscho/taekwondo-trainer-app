import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { C, RADII } from '@/design/tokens';
import { useData, unitsRepo, attendanceRepo } from '@/state/dataStore';
import { athletesRepo } from '@/storage/repos';
import { formatDate } from '@/domain/derivations';
import type { Athlete } from '@/domain/types';
import { toast } from '@/state/uiStore';

export default function ErfassungsPage() {
  const { id } = useParams();
  const { groups, beltRanks } = useData();
  const unit = unitsRepo.get(id!);
  const [records, setRecords] = useState(() => unit ? attendanceRepo.byUnit(unit.id) : []);
  const [athletes, setAthletes] = useState<Athlete[]>(() => unit ? athletesRepo.byGroup(unit.groupId) : []);

  useEffect(() => { if (unit) setAthletes(athletesRepo.byGroup(unit.groupId)); }, [unit?.groupId]);

  if (!unit) return <div style={{ padding: 30, textAlign: 'center' }}>Einheit nicht gefunden · <Link to="/anwesenheit">Zurück</Link></div>;

  const group = groups.find((g) => g.id === unit.groupId);
  const getStatus = (aid: string) => records.find((r) => r.athleteId === aid)?.present ?? null;
  const setStatus = (aid: string, p: boolean | null) => {
    attendanceRepo.set(unit.id, aid, p);
    setRecords(attendanceRepo.byUnit(unit.id));
  };
  const present = records.filter((r) => r.present === true).length;
  const absent = records.filter((r) => r.present === false).length;
  const total = present + absent;
  const quote = total ? Math.round((present / total) * 100) : 0;

  const allPresent = () => { athletes.forEach((a) => attendanceRepo.set(unit.id, a.id, true)); setRecords(attendanceRepo.byUnit(unit.id)); toast('Alle als anwesend markiert'); };
  const allAbsent = () => { athletes.forEach((a) => attendanceRepo.set(unit.id, a.id, false)); setRecords(attendanceRepo.byUnit(unit.id)); toast('Alle als abwesend markiert'); };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/anwesenheit" style={{ color: C.textMuted, textDecoration: 'none' }}>← Anwesenheit</Link>
      <Card style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0 }}>{formatDate(unit.date, { weekday: true })}</h2>
        <div style={{ fontSize: 12, color: C.textMuted }}>{group?.name} · {unit.durationMinutes} min</div>
      </Card>
      <KPIBanner items={[
        { label: 'Anwesend', value: present, color: C.success },
        { label: 'Abwesend', value: absent, color: C.danger },
        { label: 'Quote', value: quote + '%', color: quote >= 80 ? C.success : quote >= 60 ? C.warn : C.danger }
      ]} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={allPresent} style={{ padding: '8px 12px', background: C.success + '22', color: C.success, border: 'none', borderRadius: RADII.sm, flex: 1 }}>Alle anwesend</button>
        <button onClick={allAbsent} style={{ padding: '8px 12px', background: C.danger + '22', color: C.danger, border: 'none', borderRadius: RADII.sm, flex: 1 }}>Alle abwesend</button>
      </div>
      {athletes.length === 0 ? (
        <Card><div style={{ color: C.textMuted, textAlign: 'center' }}>Keine Athleten in dieser Gruppe.</div></Card>
      ) : athletes.map((a) => {
        const st = getStatus(a.id);
        const belt = beltRanks.find((b) => b.id === a.beltRankId);
        const bg = st === true ? C.success + '22' : st === false ? C.danger + '22' : C.bg;
        const next = st === null ? true : st === true ? false : null;
        return (
          <div key={a.id} onClick={() => setStatus(a.id, next)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: bg, borderRadius: RADII.md, marginBottom: 6, cursor: 'pointer' }}>
            <BeltBadge belt={belt} size="sm" />
            <span style={{ flex: 1, fontWeight: 600 }}>{a.name}</span>
            <Badge bg={st === true ? C.success : st === false ? C.danger : C.borderStrong} fg="#fff">{st === true ? '✓ Anwesend' : st === false ? '✗ Abwesend' : '· Offen'}</Badge>
          </div>
        );
      })}
    </div>
  );
}
