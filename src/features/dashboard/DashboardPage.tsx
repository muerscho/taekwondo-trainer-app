import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { SollIstBar } from '@/components/ui/SollIstBar';
import { DonutChart } from '@/components/ui/DonutChart';
import { Sparkline } from '@/components/ui/Sparkline';
import { Badge } from '@/components/ui/Badge';
import { C, RADII } from '@/design/tokens';
import { useData, statsRepo, attendanceRepo } from '@/state/dataStore';
import { formatDate, daysUntil, isoWeek, todayIso } from '@/domain/derivations';

export default function DashboardPage() {
  const { units, focusAreas, termine, athletes, groups } = useData();

  const { year, week } = isoWeek(todayIso());
  const weekUnits = useMemo(() => units.filter((u) => u.isoYear === year && u.isoWeek === week), [units, year, week]);
  const status = statsRepo.weekStatusCount(year, week);
  const dist = statsRepo.weekFocusDistribution(year, week);
  const totalMinWeek = dist.reduce((s, d) => s + d.minutes, 0) || 0;

  const trendSeries = useMemo(() => {
    const main = focusAreas.filter((f) => f.isMain).slice(0, 3);
    return main.map((f) => {
      const points: number[] = [];
      for (let offset = 3; offset >= 0; offset--) {
        const d = new Date(); d.setDate(d.getDate() - offset * 7);
        const iw = isoWeek(d.toISOString().slice(0, 10));
        const row = statsRepo.weekFocusDistribution(iw.year, iw.week).find((x) => x.focusAreaId === f.id);
        points.push(row?.minutes ?? 0);
      }
      return { color: f.colorHex, points, name: f.name };
    });
  }, [focusAreas]);

  const upcomingTermine = termine.filter((t) => daysUntil(t.date) >= 0).slice(0, 3);
  const rates = statsRepo.athleteAttendanceRates();
  const alerts = athletes.filter((a) => {
    const r = rates.find((x) => x.athleteId === a.id);
    return (r?.total ?? 0) > 0 && (r?.rate ?? 0) < 60;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <KPIBanner items={[
        { label: 'Geplant', value: status.planned, color: C.statusPlanned },
        { label: 'Durchgeführt', value: status.done, color: C.statusDone },
        { label: 'Ausgefallen', value: status.cancelled, color: C.statusCancelled },
        { label: 'Athleten', value: athletes.length }
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Wochenübersicht (KW {week})</h3>
          {weekUnits.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Keine Einheiten geplant.</div>
          ) : weekUnits.map((u) => {
            const g = groups.find((x) => x.id === u.groupId);
            const unitFocus = statsRepo.unitFocusDistribution(u.id);
            const statusColor = u.status === 'durchgeführt' ? C.statusDone : u.status === 'ausgefallen' ? C.statusCancelled : C.statusPlanned;
            return (
              <Link key={u.id} to={`/planung/einheit/${u.id}`} style={{ display: 'block', padding: '10px 12px', marginBottom: 6, background: C.bg, borderRadius: RADII.md, textDecoration: 'none', color: C.text, borderLeft: `4px solid ${statusColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span>{u.weekday} {formatDate(u.date, { year: false })}</span>
                  <span>{u.durationMinutes} min</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{g?.name ?? '—'} · {unitFocus.map((f) => f.name).join(', ') || 'Keine Blöcke'}</div>
              </Link>
            );
          })}
          <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>{status.done} von {weekUnits.length} Einheiten durchgeführt</div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Schwerpunkte (KW {week})</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <DonutChart data={dist.map((d) => ({ name: d.name, value: d.minutes, color: d.colorHex }))} size={140} thickness={22} />
            <div style={{ flex: 1 }}>
              {focusAreas.map((f) => {
                const ist = totalMinWeek > 0 ? Math.round(((dist.find((d) => d.focusAreaId === f.id)?.minutes ?? 0) / totalMinWeek) * 100) : 0;
                return <SollIstBar key={f.id} compact label={f.name} soll={f.weightPercent} ist={ist} color={f.colorHex} />;
              })}
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Nächste Termine</h3>
          {upcomingTermine.length === 0 ? <div style={{ color: C.textMuted, fontSize: 13 }}>Keine Termine.</div> : upcomingTermine.map((t) => {
            const d = daysUntil(t.date);
            const isExam = t.type === 'Pruefung';
            return (
              <Link key={t.id} to={`/pruefungen/${t.id}`} style={{ display: 'block', padding: 10, marginBottom: 6, background: C.bg, borderRadius: RADII.md, textDecoration: 'none', color: C.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <Badge bg={(isExam ? C.exam : C.competition) + '22'} fg={isExam ? C.exam : C.competition}>{isExam ? '🎓 Prüfung' : '🏅 Wettkampf'}</Badge>
                  {d < 21 && <Badge bg={C.danger} fg="#fff">⚠ {d} Tage</Badge>}
                </div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(t.date, { weekday: true })} · {t.location ?? '—'}</div>
              </Link>
            );
          })}
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 10px' }}>Trendlinie (4 KW, Minuten)</h3>
          <Sparkline series={trendSeries} width={260} height={60} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 11 }}>
            {trendSeries.map((s) => (
              <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 2, background: s.color }} /> {s.name}
              </span>
            ))}
          </div>
        </Card>

        {alerts.length > 0 && (
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 10px', color: C.warn }}>⚠ Athleten-Alerts</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {alerts.map((a) => {
                const r = rates.find((x) => x.athleteId === a.id);
                return (
                  <Link key={a.id} to={`/athleten/${a.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: C.warn + '22', color: C.warn, borderRadius: 999, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                    {a.name} – Anwesenheit {r?.rate ?? 0}%
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        <Card style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 10px' }}>Schnellzugriff</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <QuickAction to="/planung" icon="➕" label="Neue Einheit" />
            <QuickAction to="/anwesenheit" icon="✓" label="Anwesenheit" />
            <QuickAction to="/athleten" icon="👤" label="Neuer Athlet" />
            <QuickAction to="/auswertung" icon="📊" label="Auswertung" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 14, background: C.primary, color: '#fff', borderRadius: RADII.md, textDecoration: 'none' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </Link>
  );
}
