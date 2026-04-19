import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { KPIBanner } from '@/components/ui/KPIBanner';
import { BeltBadge } from '@/components/ui/BeltBadge';
import { Badge } from '@/components/ui/Badge';
import { Field, inputStyle } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { C, RADII } from '@/design/tokens';
import { useData, athletesRepo, statsRepo } from '@/state/dataStore';
import { ageYears } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import { GROUP_LEVELS } from '@/design/tokens';
import type { GroupLevel } from '@/domain/types';

export default function AthletenListePage() {
  const { athletes, groups, beltRanks, reload } = useData();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [showNew, setShowNew] = useState(false);

  const rates = useMemo(() => statsRepo.athleteAttendanceRates(), [athletes]);

  const filtered = athletes
    .filter((a) => !groupFilter || a.groupId === groupFilter)
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const avg = rates.length ? Math.round(rates.reduce((s, r) => s + r.rate, 0) / rates.length) : 0;
  const low = rates.filter((r) => r.total > 0 && r.rate < 60).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <KPIBanner items={[
        { label: 'Athleten', value: athletes.length },
        { label: 'Ø Anwesenheit', value: avg + '%', color: avg >= 80 ? C.success : avg >= 60 ? C.warn : C.danger },
        { label: 'Unter 60 %', value: low, color: low > 0 ? C.danger : C.success }
      ]} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Athleten suchen …" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, flex: '1 1 200px' }} aria-label="Suche" />
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} style={{ ...inputStyle, minWidth: 150 }} aria-label="Gruppe">
          <option value="">Alle Gruppen</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button onClick={() => setShowNew(true)} style={{ padding: '10px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>+ Neuer Athlet</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="Keine Athleten gefunden" body="Lege einen neuen Athleten an." action={<button onClick={() => setShowNew(true)} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+ Neuer Athlet</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {filtered.map((a) => {
            const g = groups.find((x) => x.id === a.groupId);
            const belt = beltRanks.find((b) => b.id === a.beltRankId);
            const rate = rates.find((r) => r.athleteId === a.id)?.rate ?? 0;
            const rateColor = rate >= 80 ? C.success : rate >= 60 ? C.warn : C.danger;
            return (
              <Link key={a.id} to={`/athleten/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 999, background: belt?.colorHex ?? C.bg, border: `3px solid ${belt?.colorBorderHex ?? C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: belt?.textColorHex ?? '#fff', fontWeight: 700 }}>
                      {a.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{ageYears(a.birthDate)} J · {g?.name ?? '—'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <BeltBadge belt={belt} size="sm" />
                    <Badge bg={rateColor + '22'} fg={rateColor}>Anwesenheit {rate}%</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {showNew && <NeuerAthletDialog onClose={() => { setShowNew(false); reload('athletes'); }} />}
    </div>
  );
}

function NeuerAthletDialog({ onClose }: { onClose: () => void }) {
  const { groups, beltRanks } = useData();
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [beltId, setBeltId] = useState(beltRanks[0]?.id ?? '');
  const [groupLevel] = useState<GroupLevel>('Einsteiger'); void groupLevel; void GROUP_LEVELS;

  const canSave = name.trim().length > 0 && birth.length === 10 && groupId && beltId;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, maxWidth: 420, width: '90%' }}>
        <h3 style={{ marginTop: 0 }}>Neuer Athlet</h3>
        <Field label="Name *"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
        <Field label="Geburtsdatum *"><input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} style={inputStyle} /></Field>
        <Field label="Gruppe">
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={inputStyle}>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <Field label="Startgurtgrad">
          <select value={beltId} onChange={(e) => setBeltId(e.target.value)} style={inputStyle}>
            {beltRanks.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!canSave} onClick={() => {
            athletesRepo.upsert({ name: name.trim(), birthDate: birth, groupId, beltRankId: beltId });
            toast('Athlet angelegt');
            onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.primary : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>Speichern</button>
        </div>
      </div>
    </div>
  );
}
