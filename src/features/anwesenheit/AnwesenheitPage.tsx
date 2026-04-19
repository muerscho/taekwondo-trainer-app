import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { C, RADII } from '@/design/tokens';
import { useData, statsRepo, attendanceRepo } from '@/state/dataStore';
import { formatDate } from '@/domain/derivations';

type Tab = 'einheiten' | 'verlauf' | 'statistik';

export default function AnwesenheitPage() {
  const [tab, setTab] = useState<Tab>('einheiten');
  const [groupFilter, setGroupFilter] = useState('');
  const { groups } = useData();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <TabBar<Tab>
        tabs={[{ id: 'einheiten', label: 'Einheiten' }, { id: 'verlauf', label: 'Verlauf' }, { id: 'statistik', label: 'Statistik' }]}
        active={tab} onChange={setTab}
      />
      <div style={{ marginBottom: 10 }}>
        <select style={{ ...inputStyle, maxWidth: 200 }} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="">Alle Gruppen</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      {tab === 'einheiten' && <EinheitenView groupFilter={groupFilter} />}
      {tab === 'verlauf' && <VerlaufView groupFilter={groupFilter} />}
      {tab === 'statistik' && <StatistikView groupFilter={groupFilter} />}
    </div>
  );
}

function EinheitenView({ groupFilter }: { groupFilter: string }) {
  const { units, groups, focusAreas, blockCategories } = useData();
  const filtered = units.filter((u) => !groupFilter || u.groupId === groupFilter).sort((a, b) => b.date.localeCompare(a.date));
  if (filtered.length === 0) return <div style={{ color: C.textMuted, padding: 30, textAlign: 'center' }}>Keine Einheiten.</div>;
  return (
    <div>
      {filtered.map((u) => {
        const records = attendanceRepo.byUnit(u.id);
        const present = records.filter((r) => r.present === true).length;
        const total = records.filter((r) => r.present !== null).length;
        const quote = total ? Math.round((present / total) * 100) : 0;
        const dist = statsRepo.unitFocusDistribution(u.id);
        const mainFocus = dist[0];
        const color = mainFocus?.colorHex ?? C.textMuted;
        const erfasst = records.length > 0;
        const g = groups.find((x) => x.id === u.groupId);
        return (
          <Link key={u.id} to={`/anwesenheit/einheit/${u.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 8 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{formatDate(u.date, { weekday: true })} · {g?.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{u.durationMinutes} min · {mainFocus?.name ?? 'Keine Blöcke'}</div>
                </div>
                {erfasst ? (
                  <Badge bg={quote >= 80 ? C.success + '22' : quote >= 60 ? C.warn + '22' : C.danger + '22'} fg={quote >= 80 ? C.success : quote >= 60 ? C.warn : C.danger}>{quote}%</Badge>
                ) : (
                  <Badge bg={C.bg} fg={C.textMuted}>Nicht erfasst</Badge>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function VerlaufView({ groupFilter }: { groupFilter: string }) {
  const { units, athletes, beltRanks } = useData();
  const relevantUnits = useMemo(() => units.filter((u) => !groupFilter || u.groupId === groupFilter).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).reverse(), [units, groupFilter]);
  const relevantAthletes = athletes.filter((a) => !groupFilter || a.groupId === groupFilter);

  if (relevantUnits.length === 0 || relevantAthletes.length === 0) return <div style={{ color: C.textMuted, padding: 20, textAlign: 'center' }}>Keine Daten für die Matrix.</div>;

  const toggle = (unitId: string, athleteId: string, cur: boolean | null) => {
    const next = cur === null ? true : cur === true ? false : null;
    attendanceRepo.set(unitId, athleteId, next);
    // Re-Render durch Set-State in parent ohne Reload — simple: location.reload könnte sein, aber effizienter:
    forceTick();
  };

  const [, tick] = useState(0);
  const forceTick = () => tick((x) => x + 1);

  return (
    <Card style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, color: C.textMuted, position: 'sticky', left: 0, background: C.surface }}>Athlet</th>
            {relevantUnits.map((u) => (
              <th key={u.id} style={{ padding: '6px 8px', fontSize: 10, color: C.textMuted }}>{formatDate(u.date, { year: false })}</th>
            ))}
            <th style={{ padding: '6px 8px', fontSize: 11, color: C.textMuted }}>Quote</th>
          </tr>
        </thead>
        <tbody>
          {relevantAthletes.map((a) => {
            const belt = beltRanks.find((b) => b.id === a.beltRankId);
            let present = 0, total = 0;
            const cells = relevantUnits.map((u) => {
              const rec = attendanceRepo.byUnit(u.id).find((r) => r.athleteId === a.id);
              if (rec?.present === true) { present++; total++; return { u, p: true as const }; }
              if (rec?.present === false) { total++; return { u, p: false as const }; }
              return { u, p: null };
            });
            const rate = total ? Math.round((present / total) * 100) : 0;
            return (
              <tr key={a.id}>
                <td style={{ padding: '6px 10px', position: 'sticky', left: 0, background: C.surface, borderRight: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <BeltBadge belt={belt} size="sm" />
                    <span style={{ fontSize: 13 }}>{a.name}</span>
                  </div>
                </td>
                {cells.map((c) => (
                  <td key={c.u.id} style={{ padding: '2px 2px', textAlign: 'center' }}>
                    <button onClick={() => toggle(c.u.id, a.id, c.p)} style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none',
                      background: c.p === true ? C.success : c.p === false ? C.danger : C.bg,
                      color: c.p === null ? C.textMuted : '#fff', fontSize: 14
                    }}>{c.p === true ? '✓' : c.p === false ? '✗' : '·'}</button>
                  </td>
                ))}
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                  {total > 0 ? <Badge bg={rate >= 80 ? C.success + '22' : rate >= 60 ? C.warn + '22' : C.danger + '22'} fg={rate >= 80 ? C.success : rate >= 60 ? C.warn : C.danger}>{rate}%</Badge> : <span style={{ color: C.textMuted, fontSize: 11 }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function StatistikView({ groupFilter }: { groupFilter: string }) {
  const { athletes, groups, beltRanks } = useData();
  const filteredAthletes = athletes.filter((a) => !groupFilter || a.groupId === groupFilter);
  const rates = statsRepo.athleteAttendanceRates().filter((r) => filteredAthletes.some((a) => a.id === r.athleteId));
  const avg = rates.length ? Math.round(rates.reduce((s, r) => s + r.rate, 0) / rates.length) : 0;
  const high = rates.filter((r) => r.rate >= 80).length;
  const mid = rates.filter((r) => r.rate >= 60 && r.rate < 80).length;
  const low = rates.filter((r) => r.rate < 60).length;

  const ranked = [...rates].sort((a, b) => b.rate - a.rate);

  return (
    <>
      <KPIBanner items={[
        { label: 'Ø Anwesenheit', value: avg + '%', color: avg >= 80 ? C.success : avg >= 60 ? C.warn : C.danger },
        { label: '≥ 80 %', value: high, color: C.success },
        { label: '60–79 %', value: mid, color: C.warn },
        { label: '< 60 %', value: low, color: C.danger }
      ]} />
      <Card>
        <h3 style={{ margin: '0 0 10px' }}>Gruppenvergleich</h3>
        {groups.map((g) => {
          const grpAthletes = athletes.filter((a) => a.groupId === g.id);
          const grpRates = rates.filter((r) => grpAthletes.some((a) => a.id === r.athleteId));
          const grpAvg = grpRates.length ? Math.round(grpRates.reduce((s, r) => s + r.rate, 0) / grpRates.length) : 0;
          return (
            <div key={g.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>{g.name}</span>
                <span style={{ color: C.textMuted }}>{grpRates.length} Athleten · Ø {grpAvg}%</span>
              </div>
              <ProgressBar value={grpAvg} color={grpAvg >= 80 ? C.success : grpAvg >= 60 ? C.warn : C.danger} />
            </div>
          );
        })}
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>Ranking</h3>
        {ranked.map((r) => {
          const a = athletes.find((x) => x.id === r.athleteId);
          if (!a) return null;
          const belt = beltRanks.find((b) => b.id === a.beltRankId);
          return (
            <div key={r.athleteId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderBottom: `1px solid ${C.border}` }}>
              <BeltBadge belt={belt} size="sm" />
              <div style={{ flex: 1, fontSize: 13 }}>{a.name}</div>
              <div style={{ width: 140 }}><ProgressBar value={r.rate} color={r.rate >= 80 ? C.success : r.rate >= 60 ? C.warn : C.danger} /></div>
              <div style={{ width: 40, textAlign: 'right', fontWeight: 700, color: r.rate >= 80 ? C.success : r.rate >= 60 ? C.warn : C.danger }}>{r.rate}%</div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
