import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { SollIstBar } from '@/components/ui/SollIstBar';
import { TimelineBlocks } from '@/components/ui/TimelineBlocks';
import { Field, inputStyle } from '@/components/ui/Field';
import { C, RADII, UNIT_DURATIONS } from '@/design/tokens';
import { useData, unitsRepo, statsRepo } from '@/state/dataStore';
import { todayIso, isoWeek, formatDate, startOfIsoWeek } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import type { UnitDuration } from '@/domain/types';

export default function PlanungPage() {
  const { units, groups, reload } = useData();
  const [showNewFor, setShowNewFor] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const base = new Date(startOfIsoWeek(todayIso()) + 'T00:00:00');
    const result: { year: number; week: number; start: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(base); d.setDate(d.getDate() + i * 7);
      const iso = d.toISOString().slice(0, 10);
      const { year, week } = isoWeek(iso);
      result.push({ year, week, start: iso });
    }
    return result;
  }, []);

  const { focusAreas } = useData();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Mehrwochenplan</h2>
      {weeks.map((w) => {
        const weekUnits = units.filter((u) => u.isoYear === w.year && u.isoWeek === w.week);
        const dist = statsRepo.weekFocusDistribution(w.year, w.week);
        const totalMin = dist.reduce((s, d) => s + d.minutes, 0);
        return (
          <div key={`${w.year}-${w.week}`} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0 }}>KW {w.week} <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 400 }}>({formatDate(w.start)})</span></h3>
              <button onClick={() => setShowNewFor(w.start)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontSize: 12 }}>+ Einheit</button>
            </div>
            {totalMin > 0 && focusAreas.slice(0, 3).map((f) => {
              const ist = totalMin > 0 ? Math.round(((dist.find((d) => d.focusAreaId === f.id)?.minutes ?? 0) / totalMin) * 100) : 0;
              return <SollIstBar key={f.id} compact label={f.name} soll={f.weightPercent} ist={ist} color={f.colorHex} />;
            })}
            {weekUnits.length === 0 ? (
              <div style={{ color: C.textMuted, padding: 12, background: C.surface, borderRadius: RADII.md, fontSize: 12 }}>Keine Einheiten geplant.</div>
            ) : weekUnits.map((u) => {
              const g = groups.find((x) => x.id === u.groupId);
              const unitDist = statsRepo.unitFocusDistribution(u.id);
              const used = unitDist.reduce((s, x) => s + x.minutes, 0);
              const statusColor = u.status === 'durchgeführt' ? C.statusDone : u.status === 'ausgefallen' ? C.statusCancelled : C.statusPlanned;
              return (
                <Link key={u.id} to={`/planung/einheit/${u.id}`} style={{ display: 'block', marginBottom: 6, textDecoration: 'none', color: 'inherit' }}>
                  <Card style={{ borderLeft: `4px solid ${statusColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.weekday} {formatDate(u.date, { year: false })} · {g?.name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{u.durationMinutes} min · {used} min belegt</div>
                      </div>
                      <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: statusColor + '22', color: statusColor }}>{u.status}</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <TimelineBlocks totalMinutes={u.durationMinutes} segments={unitDist.map((d) => ({ name: d.name, color: d.colorHex, minutes: d.minutes }))} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        );
      })}

      {showNewFor && <NeueEinheitDialog startIso={showNewFor} onClose={() => { setShowNewFor(null); reload('units'); }} />}
    </div>
  );
}

function NeueEinheitDialog({ startIso, onClose }: { startIso: string; onClose: () => void }) {
  const { groups } = useData();
  const [date, setDate] = useState(startIso);
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [duration, setDuration] = useState<UnitDuration>(90);
  const canSave = !!date && !!groupId;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 360, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>Neue Einheit</h3>
        <Field label="Datum *"><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Gruppe *">
          <select style={inputStyle} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <Field label="Dauer">
          <select style={inputStyle} value={duration} onChange={(e) => setDuration(Number(e.target.value) as UnitDuration)}>
            {UNIT_DURATIONS.map((d) => <option key={d} value={d}>{d} Minuten</option>)}
          </select>
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!canSave} onClick={() => {
            unitsRepo.upsert({ date, groupId, durationMinutes: duration, status: 'geplant' });
            toast('Einheit angelegt');
            onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.primary : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Anlegen</button>
        </div>
      </div>
    </div>
  );
}
