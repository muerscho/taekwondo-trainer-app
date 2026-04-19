import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { DonutChart } from '@/components/ui/DonutChart';
import { SollIstBar } from '@/components/ui/SollIstBar';
import { Sparkline } from '@/components/ui/Sparkline';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { inputStyle } from '@/components/ui/Field';
import { C, RADII } from '@/design/tokens';
import { useData, statsRepo, attendanceRepo, goalsRepo } from '@/state/dataStore';
import { isoWeek, formatDate } from '@/domain/derivations';
import { toast } from '@/state/uiStore';

type Tab = 'schwerpunkte' | 'anwesenheit' | 'ziele';

export default function AuswertungPage() {
  const [tab, setTab] = useState<Tab>('schwerpunkte');
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <TabBar<Tab>
        tabs={[{ id: 'schwerpunkte', label: 'Schwerpunkte' }, { id: 'anwesenheit', label: 'Anwesenheit' }, { id: 'ziele', label: 'Ziele & Prüfungen' }]}
        active={tab} onChange={setTab}
      />
      {tab === 'schwerpunkte' && <Schwerpunkte />}
      {tab === 'anwesenheit' && <Anwesenheit />}
      {tab === 'ziele' && <Ziele />}
      <ExportLeiste />
    </div>
  );
}

function Schwerpunkte() {
  const { focusAreas } = useData();
  const [wochen, setWochen] = useState(4);

  const today = new Date();
  const dist: Record<string, number> = {};
  let total = 0;
  for (let i = 0; i < wochen; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i * 7);
    const iw = isoWeek(d.toISOString().slice(0, 10));
    const row = statsRepo.weekFocusDistribution(iw.year, iw.week);
    for (const r of row) { dist[r.focusAreaId] = (dist[r.focusAreaId] ?? 0) + r.minutes; total += r.minutes; }
  }
  const donut = focusAreas.map((f) => ({ name: f.name, value: dist[f.id] ?? 0, color: f.colorHex }));

  const trend = focusAreas.filter((f) => f.isMain).slice(0, 3).map((f) => {
    const points: number[] = [];
    for (let i = wochen - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i * 7);
      const iw = isoWeek(d.toISOString().slice(0, 10));
      const row = statsRepo.weekFocusDistribution(iw.year, iw.week).find((x) => x.focusAreaId === f.id);
      points.push(row?.minutes ?? 0);
    }
    return { color: f.colorHex, points, name: f.name };
  });

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[4, 8, 12].map((w) => (
          <button key={w} onClick={() => setWochen(w)} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${wochen === w ? C.primary : C.border}`, background: wochen === w ? C.primary + '22' : 'transparent', color: wochen === w ? C.primary : C.textMuted, fontWeight: wochen === w ? 700 : 500 }}>{w} Wochen</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Verteilung</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}><DonutChart data={donut} /></div>
        </Card>
        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Soll / Ist</h3>
          {focusAreas.map((f) => {
            const ist = total > 0 ? Math.round(((dist[f.id] ?? 0) / total) * 100) : 0;
            return <SollIstBar key={f.id} label={f.name} soll={f.weightPercent} ist={ist} color={f.colorHex} />;
          })}
        </Card>
        <Card style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 10px' }}>Trendlinie</h3>
          <Sparkline series={trend} width={600} height={80} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 12 }}>
            {trend.map((s) => <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: s.color }} /> {s.name}</span>)}
          </div>
        </Card>
      </div>
    </>
  );
}

function Anwesenheit() {
  const { athletes, groups, units, beltRanks } = useData();
  const [groupFilter, setGroupFilter] = useState('');
  const filtered = athletes.filter((a) => !groupFilter || a.groupId === groupFilter);
  const rates = statsRepo.athleteAttendanceRates().filter((r) => filtered.some((a) => a.id === r.athleteId));
  const avg = rates.length ? Math.round(rates.reduce((s, r) => s + r.rate, 0) / rates.length) : 0;
  const high = rates.filter((r) => r.rate >= 80).length;
  const low = rates.filter((r) => r.rate < 60).length;

  const recentUnits = [...units].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12).reverse();

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <select style={{ ...inputStyle, maxWidth: 200 }} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="">Alle Gruppen</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <KPIBanner items={[
        { label: 'Ø Quote', value: avg + '%', color: avg >= 80 ? C.success : avg >= 60 ? C.warn : C.danger },
        { label: '≥ 80 %', value: high, color: C.success },
        { label: '< 60 %', value: low, color: C.danger }
      ]} />
      <Card>
        <h3 style={{ margin: '0 0 10px' }}>Heatmap – letzte 12 Einheiten</h3>
        {filtered.map((a) => {
          const belt = beltRanks.find((b) => b.id === a.beltRankId);
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <BeltBadge belt={belt} size="sm" />
              <span style={{ width: 140, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
              <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                {recentUnits.map((u) => {
                  const rec = attendanceRepo.byUnit(u.id).find((r) => r.athleteId === a.id);
                  const color = rec?.present === true ? C.success : rec?.present === false ? C.danger : C.bg;
                  return <div key={u.id} style={{ width: 16, height: 16, borderRadius: 3, background: color }} title={`${formatDate(u.date)}: ${rec?.present === true ? 'anwesend' : rec?.present === false ? 'abwesend' : 'nicht erfasst'}`} />;
                })}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}

function Ziele() {
  const { athletes, beltRanks, termine } = useData();
  let total = 0, done = 0;
  const allGoals = athletes.map((a) => ({ id: a.id, goals: goalsRepo.byAthlete(a.id) }));
  for (const a of allGoals) { total += a.goals.length; done += a.goals.filter((x) => x.achieved).length; }
  const open = total - done;
  return (
    <>
      <KPIBanner items={[
        { label: 'Ziele gesamt', value: total },
        { label: 'Erreicht', value: done, color: C.success },
        { label: 'Offen', value: open, color: C.warn }
      ]} />
      <Card>
        <h3 style={{ margin: '0 0 10px' }}>Fortschritt je Athlet</h3>
        {athletes.map((a) => {
          const belt = beltRanks.find((b) => b.id === a.beltRankId);
          const g = allGoals.find((x) => x.id === a.id)?.goals ?? [];
          const achieved = g.filter((x) => x.achieved).length;
          const pct = g.length ? Math.round((achieved / g.length) * 100) : 0;
          return (
            <div key={a.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <BeltBadge belt={belt} size="sm" />
                <span style={{ flex: 1, fontSize: 13 }}>{a.name}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{achieved}/{g.length}</span>
              </div>
              <ProgressBar value={pct} color={pct === 100 ? C.success : C.primary} />
            </div>
          );
        })}
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>Prüfungsbereitschaft</h3>
        {termine.filter((t) => t.type === 'Pruefung').map((t) => {
          const r = statsRepo.terminReadiness(t.id);
          return (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Badge bg={C.exam + '22'} fg={C.exam}>🎓 {formatDate(t.date, { year: false })}</Badge>
                <span style={{ flex: 1, fontSize: 13 }}>{t.label}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{r.fulfilled}/{r.total}</span>
              </div>
              <ProgressBar value={r.pct} color={r.pct >= 75 ? C.success : r.pct >= 50 ? C.warn : C.danger} />
            </div>
          );
        })}
      </Card>
    </>
  );
}

function ExportLeiste() {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
      <button onClick={() => toast('CSV-Export wird in Kürze verfügbar', 'info')} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>📊 CSV</button>
      <button onClick={() => toast('PDF-Export wird in Kürze verfügbar', 'info')} style={{ padding: '8px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm }}>📄 PDF</button>
    </div>
  );
}
