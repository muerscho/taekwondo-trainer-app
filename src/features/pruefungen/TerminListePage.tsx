import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { C, RADII } from '@/design/tokens';
import { useData, termineRepo, statsRepo } from '@/state/dataStore';
import { formatDate, daysUntil } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import type { TerminTyp } from '@/domain/types';

export default function TerminListePage() {
  const { termine, reload } = useData();
  const [filter, setFilter] = useState<'all' | 'Pruefung' | 'Wettkampf'>('all');
  const [showNew, setShowNew] = useState(false);

  const list = [...termine]
    .filter((t) => filter === 'all' || t.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>Alle</button>
        <button onClick={() => setFilter('Pruefung')} style={chip(filter === 'Pruefung', C.exam)}>🎓 Prüfungen</button>
        <button onClick={() => setFilter('Wettkampf')} style={chip(filter === 'Wettkampf', C.competition)}>🏅 Wettkämpfe</button>
        <button onClick={() => setShowNew(true)} style={{ marginLeft: 'auto', padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+ Neuer Termin</button>
      </div>
      {list.length === 0 ? <div style={{ color: C.textMuted, textAlign: 'center', padding: 30 }}>Keine Termine.</div> : list.map((t) => {
        const d = daysUntil(t.date);
        const ready = statsRepo.terminReadiness(t.id);
        const ath = termineRepo.assignees(t.id).length;
        const isExam = t.type === 'Pruefung';
        return (
          <Link key={t.id} to={`/pruefungen/${t.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 8 }}>
            <Card style={{ borderLeft: `4px solid ${isExam ? C.exam : C.competition}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{isExam ? '🎓 Prüfung' : '🏅 Wettkampf'}</div>
                  <div style={{ fontWeight: 700 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{formatDate(t.date, { weekday: true })} · {t.location ?? '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge bg={d < 21 ? C.danger : isExam ? C.exam : C.competition} fg="#fff">{d >= 0 ? `in ${d} Tagen` : `vor ${Math.abs(d)} Tagen`}</Badge>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{ath} Athleten</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: C.textMuted }}>Bereitschaft</span>
                  <span style={{ fontWeight: 700 }}>{ready.pct}%</span>
                </div>
                <ProgressBar value={ready.pct} color={ready.pct >= 75 ? C.success : ready.pct >= 50 ? C.warn : C.danger} />
              </div>
            </Card>
          </Link>
        );
      })}
      {showNew && <NeuerTerminDialog onClose={() => { setShowNew(false); reload('termine'); }} />}
    </div>
  );
}

function chip(active: boolean, color: string = C.primary): React.CSSProperties {
  return { padding: '6px 14px', borderRadius: 999, border: `1px solid ${active ? color : C.border}`, background: active ? color + '22' : 'transparent', color: active ? color : C.textMuted, fontWeight: active ? 700 : 500 };
}

function NeuerTerminDialog({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<TerminTyp>('Pruefung');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const canSave = label.trim() && date;
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 400, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>Neuer Termin</h3>
        <Field label="Typ">
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setType('Pruefung')} style={{ flex: 1, padding: 10, borderRadius: RADII.sm, border: 'none', background: type === 'Pruefung' ? C.exam : C.bg, color: type === 'Pruefung' ? '#fff' : C.text }}>🎓 Prüfung</button>
            <button onClick={() => setType('Wettkampf')} style={{ flex: 1, padding: 10, borderRadius: RADII.sm, border: 'none', background: type === 'Wettkampf' ? C.competition : C.bg, color: type === 'Wettkampf' ? '#fff' : C.text }}>🏅 Wettkampf</button>
          </div>
        </Field>
        <Field label="Bezeichnung *"><input style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
        <Field label="Datum *"><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Ort"><input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!canSave} onClick={() => {
            const t = termineRepo.upsert({ type, label: label.trim(), date, location: location || null });
            const defaultPhases = type === 'Pruefung'
              ? [{ name: 'Grundlagen', durationWeeks: 4, focusTopic: 'Technik & Poomsae' }, { name: 'Intensiv', durationWeeks: 3, focusTopic: 'Prüfungssimulation' }, { name: 'Tapering', durationWeeks: 1, focusTopic: 'Feinschliff' }]
              : [{ name: 'Aufbau', durationWeeks: 4, focusTopic: 'Kondition' }, { name: 'Intensiv', durationWeeks: 3, focusTopic: 'Sparring' }, { name: 'Tapering', durationWeeks: 1, focusTopic: 'Wettkampf-Simulation' }];
            termineRepo.setPhases(t.id, defaultPhases);
            toast('Termin angelegt');
            onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.primary : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Anlegen</button>
        </div>
      </div>
    </div>
  );
}
