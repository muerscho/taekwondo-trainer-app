import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Field, inputStyle } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { TimelineBlocks } from '@/components/ui/TimelineBlocks';
import { SchwerpunktBadge } from '@/components/ui/SchwerpunktBadge';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { DirtyFlagSaveButton } from '@/components/ui/DirtyFlagSaveButton';
import { C, RADII, UNIT_DURATIONS, UNIT_STATUS } from '@/design/tokens';
import { useData, unitsRepo, blocksRepo, libraryRepo, recommendationsRepo } from '@/state/dataStore';
import { aiConfigRepo } from '@/storage/repos';
import { buildProvider } from '@/ai/factory';
import { uuid, nowIso, formatDate } from '@/domain/derivations';
import { toast } from '@/state/uiStore';
import type { TrainingBlock, UnitDuration, UnitStatus, LibraryEntry } from '@/domain/types';

export default function EinheitEditorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { groups, blockCategories, focusAreas, reload } = useData();
  const unit = unitsRepo.get(id!);
  if (!unit) return <div style={{ padding: 30, textAlign: 'center' }}>Einheit nicht gefunden · <Link to="/planung">Zurück</Link></div>;

  const [blocks, setBlocks] = useState<TrainingBlock[]>(() => blocksRepo.byUnit(unit.id));
  const [date, setDate] = useState(unit.date);
  const [groupId, setGroupId] = useState(unit.groupId);
  const [duration, setDuration] = useState<UnitDuration>(unit.durationMinutes);
  const [status, setStatus] = useState<UnitStatus>(unit.status);
  const [title, setTitle] = useState(unit.title ?? '');
  const [showLibrary, setShowLibrary] = useState(false);
  const [editBlock, setEditBlock] = useState<TrainingBlock | null>(null);
  const [showNewBlock, setShowNewBlock] = useState(false);
  const [showSaveToLib, setShowSaveToLib] = useState(false);
  const [showKi, setShowKi] = useState(false);

  const used = blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const puffer = duration - used;

  const refresh = () => setBlocks(blocksRepo.byUnit(unit.id));
  const isDirty = date !== unit.date || groupId !== unit.groupId || duration !== unit.durationMinutes || status !== unit.status || title !== (unit.title ?? '');

  const saveUnit = () => {
    unitsRepo.upsert({ id: unit.id, date, groupId, durationMinutes: duration, status, title: title || null });
    reload('units');
    toast('Einheit gespeichert');
  };

  const move = (bId: string, dir: 'up' | 'down') => { blocksRepo.move(bId, dir); refresh(); };
  const del = async (bId: string) => {
    if (!(await confirmDialog({ title: 'Block löschen?', body: 'Der Block wird aus der Einheit entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
    blocksRepo.remove(bId); refresh();
  };

  const schwerpunkteAb = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const b of blocks) {
      const cat = blockCategories.find((c) => c.id === b.categoryId);
      if (!cat?.focusAreaId) continue;
      acc[cat.focusAreaId] = (acc[cat.focusAreaId] ?? 0) + b.durationMinutes;
    }
    return Object.entries(acc).map(([faId, min]) => ({ faId, min }));
  }, [blocks, blockCategories]);

  const deleteUnit = async () => {
    if (!(await confirmDialog({ title: 'Einheit löschen?', body: 'Alle Blöcke und Anwesenheiten dieser Einheit werden entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
    unitsRepo.remove(unit.id); reload('units'); nav('/planung');
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/planung" style={{ color: C.textMuted, textDecoration: 'none' }}>← Planung</Link>

      <Card style={{ marginTop: 8 }}>
        <h2 style={{ marginTop: 0 }}>Einheit</h2>
        <Field label="Titel (optional)"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
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
        <Field label="Status">
          <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value as UnitStatus)}>
            {UNIT_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Blöcke</h3>
          <div style={{ fontSize: 11, color: puffer < 0 ? C.danger : C.textMuted }}>Belegt {used} / {duration} min · Puffer {puffer >= 0 ? '+' : ''}{puffer} min</div>
        </div>
        <TimelineBlocks totalMinutes={duration} segments={blocks.map((b) => ({ name: b.title, color: focusAreas.find((f) => f.id === blockCategories.find((c) => c.id === b.categoryId)?.focusAreaId)?.colorHex ?? C.primary, minutes: b.durationMinutes }))} />

        {schwerpunkteAb.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Abgeleitete Schwerpunkte:</span>
            {schwerpunkteAb.map((s) => <SchwerpunktBadge key={s.faId} focus={focusAreas.find((f) => f.id === s.faId)} />)}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          {blocks.length === 0 && <div style={{ color: C.textMuted, padding: 12, textAlign: 'center' }}>Noch keine Blöcke. Füge einen Block aus der Bibliothek hinzu oder erstelle einen eigenen.</div>}
          {blocks.map((b, i) => {
            const cat = blockCategories.find((c) => c.id === b.categoryId);
            const focus = focusAreas.find((f) => f.id === cat?.focusAreaId);
            return (
              <div key={b.id} style={{ background: C.bg, padding: 10, borderRadius: RADII.md, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button disabled={i === 0} onClick={() => move(b.id, 'up')} aria-label="Hoch" style={{ background: 'transparent', border: 'none', color: C.textMuted }}>▲</button>
                  <button disabled={i === blocks.length - 1} onClick={() => move(b.id, 'down')} aria-label="Runter" style={{ background: 'transparent', border: 'none', color: C.textMuted }}>▼</button>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{b.iconEmoji ?? '📌'}</span>
                    <strong style={{ fontSize: 13 }}>{b.title}</strong>
                    <Badge bg={focus?.colorHex + '22'} fg={focus?.colorHex}>{cat?.name ?? '—'}</Badge>
                    <Badge bg={C.bg} fg={C.textMuted}>{b.source === 'library' ? '📚 Bibliothek' : '✏️ Individuell'}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{b.durationMinutes} min {b.note && `· ${b.note}`}</div>
                </div>
                <button onClick={() => setEditBlock(b)} aria-label="Bearbeiten" style={{ background: 'transparent', border: 'none', color: C.textMuted }}>✏️</button>
                <button onClick={() => del(b.id)} aria-label="Löschen" style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          <button onClick={() => setShowLibrary(true)} style={{ padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm, fontSize: 12 }}>📚 Aus Bibliothek</button>
          <button onClick={() => setShowNewBlock(true)} style={{ padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: RADII.sm, fontSize: 12 }}>✏️ Individuell</button>
          <button onClick={() => setShowKi(true)} style={{ padding: '8px 12px', background: C.primary + '12', color: C.primary, border: `1px solid ${C.primary}33`, borderRadius: RADII.sm, fontSize: 12 }}>✨ KI-Vorschlag</button>
          <button onClick={() => setShowSaveToLib(true)} style={{ padding: '8px 12px', background: C.success + '12', color: C.success, border: `1px solid ${C.success}33`, borderRadius: RADII.sm, fontSize: 12 }}>💾 In Bibliothek speichern</button>
          <button onClick={deleteUnit} style={{ padding: '8px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: RADII.sm, fontSize: 12, marginLeft: 'auto' }}>🗑 Einheit löschen</button>
        </div>
      </Card>

      <DirtyFlagSaveButton isDirty={isDirty} onSave={saveUnit} />

      <BibliothekPicker open={showLibrary} onClose={() => setShowLibrary(false)} onPick={(entries) => {
        for (const e of entries) {
          blocksRepo.upsert({
            trainingUnitId: unit.id, title: e.title, categoryId: e.categoryId,
            durationMinutes: e.durationMinutes, source: 'library', sourceLibraryEntryId: e.id
          });
        }
        refresh(); setShowLibrary(false); toast(`${entries.length} Block(s) hinzugefügt`);
      }} />
      {showNewBlock && <BlockDialog onClose={() => setShowNewBlock(false)} onSave={(b) => {
        blocksRepo.upsert({ trainingUnitId: unit.id, ...b, source: 'custom' }); refresh();
      }} />}
      {editBlock && <BlockDialog block={editBlock} onClose={() => setEditBlock(null)} onSave={(b) => {
        blocksRepo.upsert({ id: editBlock.id, trainingUnitId: unit.id, source: editBlock.source, sourceLibraryEntryId: editBlock.sourceLibraryEntryId ?? null, ...b }); refresh();
      }} />}
      {showSaveToLib && <SaveToLibDialog unitId={unit.id} blocks={blocks} onClose={() => setShowSaveToLib(false)} />}
      {showKi && <KiVorschlagDialog onClose={() => setShowKi(false)} context={{
        gruppe: groups.find((g) => g.id === groupId)?.name ?? '', gurtgrad: 'gemischt', schwerpunkt: focusAreas[0]?.name ?? 'Technik', dauer: duration
      }} onApply={(vorschlag) => {
        for (const b of vorschlag.bloecke) {
          const cat = blockCategories.find((c) => c.name.toLowerCase() === b.kategorie.toLowerCase()) ?? blockCategories[0];
          blocksRepo.upsert({ trainingUnitId: unit.id, title: b.titel, categoryId: cat.id, durationMinutes: b.minuten, source: 'custom', note: b.notiz ?? null });
        }
        refresh(); setShowKi(false); toast('KI-Vorschlag übernommen');
      }} />}
    </div>
  );
}

function BlockDialog({ block, onClose, onSave }: { block?: TrainingBlock; onClose: () => void; onSave: (b: { title: string; categoryId: string; durationMinutes: number; iconEmoji?: string | null; note?: string | null }) => void }) {
  const { blockCategories } = useData();
  const [title, setTitle] = useState(block?.title ?? '');
  const [catId, setCatId] = useState(block?.categoryId ?? blockCategories[0]?.id);
  const [dur, setDur] = useState(block?.durationMinutes ?? 15);
  const [icon, setIcon] = useState(block?.iconEmoji ?? '');
  const [note, setNote] = useState(block?.note ?? '');

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 400, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>{block ? 'Block bearbeiten' : 'Individueller Block'}</h3>
        <Field label="Titel *"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Kategorie">
          <select style={inputStyle} value={catId} onChange={(e) => setCatId(e.target.value)}>
            {blockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Dauer (min)"><input type="number" min={0} style={inputStyle} value={dur} onChange={(e) => setDur(Math.max(0, Number(e.target.value) || 0))} /></Field>
        <Field label="Icon (Emoji)"><input style={inputStyle} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="z. B. 🏃" /></Field>
        <Field label="Notiz"><textarea style={{ ...inputStyle, minHeight: 60 }} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!title.trim()} onClick={() => { onSave({ title: title.trim(), categoryId: catId, durationMinutes: dur, iconEmoji: icon || null, note: note || null }); onClose(); }} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Speichern</button>
        </div>
      </div>
    </div>
  );
}

function BibliothekPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (entries: LibraryEntry[]) => void }) {
  const { library, blockCategories } = useData();
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [sel, setSel] = useState<Record<string, boolean>>({});
  const filtered = library.filter((e) => (!cat || e.categoryId === cat) && (!q || e.title.toLowerCase().includes(q.toLowerCase())));
  const selected = Object.keys(sel).filter((k) => sel[k]).map((id) => library.find((l) => l.id === id)!).filter(Boolean);

  return (
    <BottomSheet open={open} onClose={onClose} title="Bibliothek">
      <input placeholder="Suche …" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 8 }} />
      <select style={{ ...inputStyle, width: '100%', marginBottom: 8 }} value={cat} onChange={(e) => setCat(e.target.value)}>
        <option value="">Alle Kategorien</option>
        {blockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {filtered.length === 0 && <div style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>Keine Einträge.</div>}
      {filtered.map((e) => (
        <div key={e.id} onClick={() => setSel({ ...sel, [e.id]: !sel[e.id] })}
          style={{ padding: 10, marginBottom: 6, borderRadius: RADII.md, background: sel[e.id] ? C.primary + '12' : C.bg, border: sel[e.id] ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer' }}>
          <div style={{ fontWeight: 600 }}>{e.title}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{blockCategories.find((c) => c.id === e.categoryId)?.name} · {e.niveau} · {e.durationMinutes} min</div>
        </div>
      ))}
      {selected.length > 0 && (
        <button onClick={() => onPick(selected)} style={{ position: 'sticky', bottom: 0, width: '100%', padding: '12px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.md, fontWeight: 600, marginTop: 10 }}>
          {selected.length} Eintrag(e) übernehmen
        </button>
      )}
    </BottomSheet>
  );
}

function SaveToLibDialog({ unitId, blocks, onClose }: { unitId: string; blocks: TrainingBlock[]; onClose: () => void }) {
  const { blockCategories, reload } = useData();
  const [title, setTitle] = useState('');
  const total = blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const cats = Array.from(new Set(blocks.map((b) => blockCategories.find((c) => c.id === b.categoryId)?.name).filter(Boolean)));

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 400, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>In Bibliothek speichern</h3>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Vorschau: {blocks.length} Blöcke · {total} min · {cats.join(', ')}</div>
        <Field label="Titel *"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Hiit 90 min" /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!title.trim()} onClick={() => {
            const catId = blocks[0]?.categoryId ?? blockCategories[0]?.id;
            libraryRepo.upsert({ type: 'Workout', title: title.trim(), categoryId: catId, niveau: 'Mittelstufe', durationMinutes: total, source: 'from_planning', createdFromUnitId: unitId });
            reload('library'); toast('In Bibliothek gespeichert'); onClose();
          }} style={{ padding: '8px 14px', background: C.success, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Speichern</button>
        </div>
      </div>
    </div>
  );
}

function KiVorschlagDialog({ onClose, context, onApply }: { onClose: () => void; context: any; onApply: (v: any) => void }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [vorschlag, setVorschlag] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = aiConfigRepo.get();
        const p = await buildProvider(cfg);
        if (!p) throw new Error('Kein API-Key konfiguriert. Bitte in Einstellungen → KI konfigurieren.');
        const v = await p.suggestEinheit(context);
        setVorschlag(v);
      } catch (e) { setErr((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 480, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>✨ KI-Vorschlag</h3>
        {loading && <div style={{ color: C.textMuted }}>Lade …</div>}
        {err && <div style={{ color: C.danger, fontSize: 13 }}>{err}</div>}
        {vorschlag && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{vorschlag.titel}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>{vorschlag.begruendung}</div>
            {vorschlag.bloecke?.map((b: any, i: number) => (
              <div key={i} style={{ padding: 8, background: C.bg, borderRadius: RADII.sm, marginBottom: 4, fontSize: 12 }}>
                <strong>{b.titel}</strong> · {b.kategorie} · {b.minuten} min
                {b.notiz && <div style={{ color: C.textMuted }}>{b.notiz}</div>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Verwerfen</button>
              <button onClick={() => onApply(vorschlag)} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Übernehmen</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
