import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TimelineBlocks } from '@/components/ui/TimelineBlocks';
import { SchwerpunktBadge } from '@/components/ui/SchwerpunktBadge';
import { DonutChart } from '@/components/ui/DonutChart';
import { C, RADII } from '@/design/tokens';
import { useData, blocksRepo, libraryRepo, statsRepo, unitsRepo } from '@/state/dataStore';
import { formatDate, formatDuration } from '@/domain/derivations';

function youtubeUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export default function EinheitHandoutPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { groups, focusAreas } = useData();
  const unit = id ? unitsRepo.get(id) : null;

  if (!unit) {
    return <div style={{ padding: 30, textAlign: 'center' }}>Einheit nicht gefunden · <Link to="/planung">Zurück</Link></div>;
  }

  const blocks = blocksRepo.byUnit(unit.id);
  const group = groups.find((g) => g.id === unit.groupId);
  const dist = statsRepo.unitFocusDistribution(unit.id);
  const used = blocks.reduce((s, b) => s + b.durationMinutes, 0);

  const statusColor = unit.status === 'durchgeführt' ? C.statusDone : unit.status === 'ausgefallen' ? C.statusCancelled : C.statusPlanned;

  const enrichedBlocks = useMemo(() => blocks.map((b) => {
    const focus = focusAreas.find((f) => f.id === b.categoryId); // categoryId = Schwerpunkt-ID (Migration 0004)
    const lib = b.sourceLibraryEntryId ? libraryRepo.get(b.sourceLibraryEntryId) : null;
    const steps = lib ? libraryRepo.steps(lib.id) : [];
    const materials = lib ? libraryRepo.materials(lib.id) : [];
    return { block: b, category: focus, focus, library: lib, steps, materials };
  }), [blocks, focusAreas]);

  const aggregatedMaterials = useMemo(() => {
    const set = new Set<string>();
    for (const e of enrichedBlocks) for (const m of e.materials) set.add(m.text.trim());
    return Array.from(set).filter(Boolean);
  }, [enrichedBlocks]);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Link to="/planung" style={{ color: C.textMuted, textDecoration: 'none' }}>← Planung</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav(`/planung/einheit/${unit.id}`)} style={btnGhost}>✏️ Bearbeiten</button>
          <button onClick={() => nav(`/planung/einheit/${unit.id}/run`)} style={btnPrimary}>▶ Starten</button>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Badge bg={statusColor + '22'} fg={statusColor}>{unit.status}</Badge>
          <Badge bg={C.bg} fg={C.textMuted}>{group?.name ?? '—'}</Badge>
          <Badge bg={C.bg} fg={C.textMuted}>{formatDuration(unit.durationMinutes)}</Badge>
        </div>
        <h2 style={{ margin: '4px 0' }}>{unit.title || 'Trainingseinheit'}</h2>
        <div style={{ color: C.textMuted, fontSize: 13 }}>{formatDate(unit.date, { weekday: true })}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: 16, marginTop: 16, alignItems: 'center' }}>
          {dist.some((d) => d.minutes > 0) ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart data={dist.map((d) => ({ name: d.name, value: d.minutes, color: d.colorHex }))} size={160} thickness={22} />
            </div>
          ) : <div />}
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Belegt {used} / {unit.durationMinutes} min · {blocks.length} Blöcke</div>
            <TimelineBlocks totalMinutes={unit.durationMinutes} segments={dist.map((d) => ({ name: d.name, color: d.colorHex, minutes: d.minutes }))} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {dist.filter((d) => d.minutes > 0).map((d) => (
                <SchwerpunktBadge key={d.focusAreaId} focus={focusAreas.find((f) => f.id === d.focusAreaId)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {aggregatedMaterials.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 8px' }}>📦 Material vorbereiten</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {aggregatedMaterials.map((m) => <li key={m} style={{ marginBottom: 2 }}>{m}</li>)}
          </ul>
        </Card>
      )}

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ margin: '0 0 12px' }}>Ablauf</h3>
        {enrichedBlocks.length === 0 && <div style={{ color: C.textMuted, padding: 12, textAlign: 'center' }}>Keine Blöcke geplant.</div>}
        {enrichedBlocks.map((e, i) => (
          <div key={e.block.id} style={{
            padding: 12, borderRadius: RADII.md, marginBottom: 10,
            background: C.bg, borderLeft: `4px solid ${e.focus?.colorHex ?? C.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>#{i + 1}</div>
              <span style={{ fontSize: 18 }}>{e.block.iconEmoji ?? '📌'}</span>
              <strong style={{ fontSize: 15 }}>{e.block.title}</strong>
              <Badge bg={C.surface} fg={C.text}>{formatDuration(e.block.durationMinutes)}</Badge>
              {e.focus && <SchwerpunktBadge focus={e.focus} />}
              {e.category && <Badge bg={C.surface} fg={C.textMuted}>{e.category.name}</Badge>}
              {e.block.source === 'library' && <Badge bg={C.surface} fg={C.textMuted}>📚 Bibliothek</Badge>}
              {e.block.source === 'custom' && <Badge bg={C.surface} fg={C.textMuted}>✏️ Individuell</Badge>}
            </div>

            {e.block.note && (
              <div style={{ marginTop: 8, fontSize: 13, color: C.text, fontStyle: 'italic' }}>
                Hinweis: {e.block.note}
              </div>
            )}

            {e.library?.description && (
              <div style={{ marginTop: 8, fontSize: 13, color: C.text }}>
                {e.library.description}
              </div>
            )}

            {e.steps.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>Schritt-für-Schritt</div>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {e.steps.map((s) => <li key={s.id} style={{ marginBottom: 2 }}>{s.text}</li>)}
                </ol>
              </div>
            )}

            {e.materials.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>Material</div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {e.materials.map((m) => <li key={m.id}>{m.text}</li>)}
                </ul>
              </div>
            )}

            {e.library?.youtubeVideoId && (
              <div style={{ marginTop: 10 }}>
                <a href={youtubeUrl(e.library.youtubeVideoId)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.primary, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  ▶ Video auf YouTube öffnen
                </a>
              </div>
            )}
          </div>
        ))}
      </Card>

      <div style={{ height: 24 }} />
    </div>
  );
}

const btnGhost: React.CSSProperties = {
  padding: '8px 14px', background: C.bg, color: C.text, border: `1px solid ${C.border}`,
  borderRadius: RADII.sm, fontSize: 13, cursor: 'pointer'
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', background: C.primary, color: '#fff', border: 'none',
  borderRadius: RADII.sm, fontSize: 13, fontWeight: 600, cursor: 'pointer'
};
