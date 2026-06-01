import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { SollIstBar } from '@/components/ui/SollIstBar';
import { TimelineBlocks } from '@/components/ui/TimelineBlocks';
import { Field, inputStyle } from '@/components/ui/Field';
import { C, RADII, UNIT_DURATIONS, WEEKDAYS } from '@/design/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useData, unitsRepo, statsRepo } from '@/state/dataStore';
import { todayIso, isoWeek, formatDate, startOfIsoWeek, weekdayOf } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import type { UnitDuration, UnitStatus, TrainingUnit } from '@/domain/types';

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const statusColor = (s: UnitStatus) =>
  s === 'durchgeführt' ? C.statusDone : s === 'ausgefallen' ? C.statusCancelled : C.statusPlanned;

function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Wochen-Matrix (Mo–So) für die Monatsansicht. Enthält Rand-Tage der Nachbarmonate.
function buildMonthGrid(year: number, month: number): string[][] {
  const firstDow = (new Date(year, month, 1).getDay() || 7) - 1; // 0 = Montag
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows = Math.ceil((firstDow + daysInMonth) / 7);
  const cur = new Date(year, month, 1 - firstDow);
  const weeks: string[][] = [];
  for (let w = 0; w < rows; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) { row.push(localIso(cur)); cur.setDate(cur.getDate() + 1); }
    weeks.push(row);
  }
  return weeks;
}

function useStartRun() {
  const nav = useNavigate();
  return (e: React.MouseEvent, unitId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(`tkd:run:${unitId}`); } catch { /* ignore */ }
    nav(`/planung/einheit/${unitId}/run`);
  };
}

export default function PlanungPage() {
  const { reload } = useData();
  const [view, setView] = useState<'kalender' | 'liste'>('kalender');
  const [showNewFor, setShowNewFor] = useState<string | null>(null);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
    background: active ? C.primary : C.surface, color: active ? '#fff' : C.text,
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Planung</h2>
        <div style={{ display: 'inline-flex', border: `1px solid ${C.borderStrong}`, borderRadius: RADII.sm, overflow: 'hidden' }}>
          <button onClick={() => setView('kalender')} style={tabBtn(view === 'kalender')}>Kalender</button>
          <button onClick={() => setView('liste')} style={tabBtn(view === 'liste')}>Mehrwochenplan</button>
        </div>
      </div>

      {view === 'kalender' ? <KalenderPlanung onNew={setShowNewFor} /> : <MehrwochenListe onNew={setShowNewFor} />}

      {showNewFor && <NeueEinheitDialog startIso={showNewFor} onClose={() => { setShowNewFor(null); reload('units'); }} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kalender (Hauptansicht): Monatsraster auf Tablet/Desktop, Agenda auf Mobil.
// Jeder Tag ist frei beplanbar – beliebig viele Einheiten je Tag.
// ---------------------------------------------------------------------------
function KalenderPlanung({ onNew }: { onNew: (iso: string) => void }) {
  const { units, groups } = useData();
  const bp = useBreakpoint();
  const today = todayIso();
  const [cursor, setCursor] = useState(() => {
    const d = new Date(today + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const unitsByDate = useMemo(() => {
    const m = new Map<string, TrainingUnit[]>();
    for (const u of units) {
      const arr = m.get(u.date);
      if (arr) arr.push(u); else m.set(u.date, [u]);
    }
    return m;
  }, [units]);

  const weeks = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);

  const goPrev = () => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  const goNext = () => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  const goToday = () => { const d = new Date(today + 'T00:00:00'); setCursor({ year: d.getFullYear(), month: d.getMonth() }); };

  // Default-Datum für "+ Einheit": heute, sofern der angezeigte Monat der aktuelle ist, sonst Monatserster.
  const defaultIso = (() => {
    const t = new Date(today + 'T00:00:00');
    if (t.getFullYear() === cursor.year && t.getMonth() === cursor.month) return today;
    return localIso(new Date(cursor.year, cursor.month, 1));
  })();

  const navBtn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: RADII.sm, border: `1px solid ${C.borderStrong}`,
    background: C.surface, color: C.text, cursor: 'pointer', fontSize: 16, lineHeight: 1,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={goPrev} aria-label="Vorheriger Monat" style={navBtn}>‹</button>
          <div style={{ fontWeight: 700, fontSize: 16, minWidth: 150, textAlign: 'center' }}>{MONTHS[cursor.month]} {cursor.year}</div>
          <button onClick={goNext} aria-label="Nächster Monat" style={navBtn}>›</button>
        </div>
        <button onClick={goToday} style={{ padding: '6px 12px', fontSize: 12, border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.text, borderRadius: RADII.sm, cursor: 'pointer' }}>Heute</button>
      </div>

      {bp === 'mobile'
        ? <AgendaMonat weeks={weeks} month={cursor.month} unitsByDate={unitsByDate} defaultIso={defaultIso} onNew={onNew} />
        : <MonatsRaster weeks={weeks} month={cursor.month} today={today} unitsByDate={unitsByDate} groups={groups} compact={bp === 'tablet'} onNew={onNew} />}
    </div>
  );
}

function MonatsRaster({ weeks, month, today, unitsByDate, groups, compact, onNew }: {
  weeks: string[][]; month: number; today: string;
  unitsByDate: Map<string, TrainingUnit[]>; groups: { id: string; name: string }[];
  compact: boolean; onNew: (iso: string) => void;
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ textAlign: 'center', fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{w}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
          {week.map((iso) => {
            const inMonth = Number(iso.slice(5, 7)) - 1 === month;
            const dayUnits = unitsByDate.get(iso) ?? [];
            const isToday = iso === today;
            return (
              <div
                key={iso}
                onClick={() => onNew(iso)}
                title="Einheit hinzufügen"
                style={{
                  minHeight: compact ? 84 : 104, background: inMonth ? C.surface : C.bg,
                  border: `1px solid ${isToday ? C.primary : C.border}`, borderRadius: RADII.sm,
                  padding: 5, cursor: 'pointer', opacity: inMonth ? 1 : 0.5,
                  display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden',
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 700 : 500, alignSelf: 'flex-start',
                  color: isToday ? '#fff' : C.text, background: isToday ? C.primary : 'transparent',
                  borderRadius: RADII.pill, minWidth: 20, height: 20, padding: '0 5px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{Number(iso.slice(8, 10))}</span>
                {dayUnits.map((u) => {
                  const g = groups.find((x) => x.id === u.groupId);
                  const sc = statusColor(u.status);
                  return (
                    <Link
                      key={u.id}
                      to={`/planung/einheit/${u.id}`}
                      onClick={(e) => e.stopPropagation()}
                      title={`${g?.name ?? '—'} · ${u.durationMinutes} min · ${u.status}`}
                      style={{
                        display: 'block', fontSize: 10, padding: '2px 4px', borderRadius: 4,
                        background: sc + '22', color: sc, textDecoration: 'none',
                        borderLeft: `3px solid ${sc}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >{g?.name ?? '—'}</Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AgendaMonat({ weeks, month, unitsByDate, defaultIso, onNew }: {
  weeks: string[][]; month: number; unitsByDate: Map<string, TrainingUnit[]>;
  defaultIso: string; onNew: (iso: string) => void;
}) {
  const daysWithUnits = weeks.flat().filter((iso) => Number(iso.slice(5, 7)) - 1 === month && (unitsByDate.get(iso)?.length ?? 0) > 0);
  return (
    <div>
      <button
        onClick={() => onNew(defaultIso)}
        style={{ width: '100%', padding: '10px 12px', marginBottom: 12, background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.md, fontSize: 14, cursor: 'pointer' }}
      >+ Einheit anlegen</button>
      {daysWithUnits.length === 0 ? (
        <div style={{ color: C.textMuted, padding: 12, background: C.surface, borderRadius: RADII.md, fontSize: 13 }}>Keine Einheiten in diesem Monat.</div>
      ) : daysWithUnits.map((iso) => (
        <div key={iso} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{weekdayOf(iso)} {formatDate(iso)}</div>
            <button onClick={() => onNew(iso)} style={{ padding: '4px 10px', fontSize: 12, background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, cursor: 'pointer' }}>+ Einheit</button>
          </div>
          {(unitsByDate.get(iso) ?? []).map((u) => <UnitCard key={u.id} u={u} showDate={false} />)}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mehrwochenplan (umschaltbar): Wochenliste inkl. Soll/Ist + alte Einheiten.
// ---------------------------------------------------------------------------
function MehrwochenListe({ onNew }: { onNew: (iso: string) => void }) {
  const { units, focusAreas } = useData();
  const [showPast, setShowPast] = useState(false);

  const currentWeekStart = useMemo(() => startOfIsoWeek(todayIso()), []);

  const weeks = useMemo(() => {
    const base = new Date(currentWeekStart + 'T00:00:00');
    const result: { year: number; week: number; start: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(base); d.setDate(d.getDate() + i * 7);
      const iso = localIso(d);
      const { year, week } = isoWeek(iso);
      result.push({ year, week, start: iso });
    }
    return result;
  }, [currentWeekStart]);

  // Vergangene Wochen aus tatsächlich vorhandenen Einheiten ableiten (leere Wochen weglassen).
  const pastWeeks = useMemo(() => {
    const map = new Map<string, { year: number; week: number; start: string }>();
    for (const u of units) {
      const start = startOfIsoWeek(u.date);
      if (start >= currentWeekStart) continue;
      const { year, week } = isoWeek(u.date);
      map.set(`${year}-${week}`, { year, week, start });
    }
    return [...map.values()].sort((a, b) => a.start.localeCompare(b.start));
  }, [units, currentWeekStart]);

  const renderWeek = (w: { year: number; week: number; start: string }, isPast: boolean) => {
    const weekUnits = units.filter((u) => u.isoYear === w.year && u.isoWeek === w.week);
    const dist = statsRepo.weekFocusDistribution(w.year, w.week);
    const totalMin = dist.reduce((s, d) => s + d.minutes, 0);
    return (
      <div key={`${w.year}-${w.week}`} style={{ marginBottom: 16, opacity: isPast ? 0.85 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ margin: 0 }}>KW {w.week} <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 400 }}>({formatDate(w.start)})</span></h3>
          {!isPast && <button onClick={() => onNew(w.start)} style={{ padding: '6px 12px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontSize: 12 }}>+ Einheit</button>}
        </div>
        {totalMin > 0 && focusAreas.slice(0, 3).map((f) => {
          const ist = totalMin > 0 ? Math.round(((dist.find((d) => d.focusAreaId === f.id)?.minutes ?? 0) / totalMin) * 100) : 0;
          return <SollIstBar key={f.id} compact label={f.name} soll={f.weightPercent} ist={ist} color={f.colorHex} />;
        })}
        {weekUnits.length === 0 ? (
          <div style={{ color: C.textMuted, padding: 12, background: C.surface, borderRadius: RADII.md, fontSize: 12 }}>Keine Einheiten geplant.</div>
        ) : weekUnits.map((u) => <UnitCard key={u.id} u={u} showDate />)}
      </div>
    );
  };

  return (
    <div>
      {pastWeeks.length > 0 && (
        <button
          onClick={() => setShowPast((v) => !v)}
          style={{ padding: '6px 12px', marginBottom: 12, background: C.surface, color: C.text, border: `1px solid ${C.borderStrong}`, borderRadius: RADII.sm, fontSize: 12, cursor: 'pointer' }}
        >
          {showPast ? '▾ Alte Einheiten ausblenden' : `▸ Alte Einheiten anzeigen (${pastWeeks.length} ${pastWeeks.length === 1 ? 'Woche' : 'Wochen'})`}
        </button>
      )}
      {showPast && pastWeeks.map((w) => renderWeek(w, true))}
      {weeks.map((w) => renderWeek(w, false))}
    </div>
  );
}

// Gemeinsame Einheiten-Karte für Liste und Agenda.
function UnitCard({ u, showDate }: { u: TrainingUnit; showDate: boolean }) {
  const { groups } = useData();
  const startRun = useStartRun();
  const g = groups.find((x) => x.id === u.groupId);
  const unitDist = statsRepo.unitFocusDistribution(u.id);
  const used = unitDist.reduce((s, x) => s + x.minutes, 0);
  const sc = statusColor(u.status);
  return (
    <Link to={`/planung/einheit/${u.id}`} style={{ display: 'block', marginBottom: 6, textDecoration: 'none', color: 'inherit' }}>
      <Card style={{ borderLeft: `4px solid ${sc}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{showDate ? `${u.weekday} ${formatDate(u.date, { year: false })} · ` : ''}{g?.name ?? '—'}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{u.durationMinutes} min · {used} min belegt</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={(e) => startRun(e, u.id)}
              title="Einheit starten"
              aria-label="Einheit starten"
              style={{
                width: 30, height: 30, borderRadius: 999,
                background: C.primary, color: '#fff', border: 'none',
                fontSize: 12, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >▶</button>
            <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: sc + '22', color: sc }}>{u.status}</div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <TimelineBlocks totalMinutes={u.durationMinutes} segments={unitDist.map((d) => ({ name: d.name, color: d.colorHex, minutes: d.minutes }))} />
        </div>
      </Card>
    </Link>
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
          <button disabled={!canSave} onClick={async () => {
            await unitsRepo.upsert({ date, groupId, durationMinutes: duration, status: 'geplant' });
            toast('Einheit angelegt');
            onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.primary : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Anlegen</button>
        </div>
      </div>
    </div>
  );
}
