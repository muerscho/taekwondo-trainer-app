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
import { useData, unitsRepo, blocksRepo, libraryRepo } from '@/state/dataStore';
import { toast } from '@/state/uiStore';
import type { TrainingBlock, UnitDuration, UnitStatus, LibraryEntry } from '@/domain/types';

export default function EinheitEditorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { groups, focusAreas, reload } = useData();
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

  const used = blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const puffer = duration - used;

  const refresh = () => setBlocks(blocksRepo.byUnit(unit.id));
  const isDirty = date !== unit.date || groupId !== unit.groupId || duration !== unit.durationMinutes || status !== unit.status || title !== (unit.title ?? '');

  const saveUnit = async () => {
    await unitsRepo.upsert({ id: unit.id, date, groupId, durationMinutes: duration, status, title: title || null });
    toast('Einheit gespeichert');
  };

  const move = async (bId: string, dir: 'up' | 'down') => { await blocksRepo.move(bId, dir); refresh(); };
  const del = async (bId: string) => {
    if (!(await confirmDialog({ title: 'Block löschen?', body: 'Der Block wird aus der Einheit entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
    await blocksRepo.remove(bId); refresh();
  };

  const schwerpunkteAb = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const b of blocks) {
      if (!b.categoryId) continue; // categoryId ist seit Migration 0004 direkt die Schwerpunkt-ID
      acc[b.categoryId] = (acc[b.categoryId] ?? 0) + b.durationMinutes;
    }
    return Object.entries(acc).map(([faId, min]) => ({ faId, min }));
  }, [blocks]);

  const deleteUnit = async () => {
    if (!(await confirmDialog({ title: 'Einheit löschen?', body: 'Alle Blöcke und Anwesenheiten dieser Einheit werden entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
    await unitsRepo.remove(unit.id); nav('/planung');
  };

  const startRun = () => {
    try { localStorage.removeItem(`tkd:run:${unit.id}`); } catch { /* ignore */ }
    nav(`/planung/einheit/${unit.id}/run`);
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/planung" style={{ color: C.textMuted, textDecoration: 'none' }}>← Planung</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to={`/planung/einheit/${unit.id}/handout`}
            style={{
              padding: '8px 14px', background: C.bg, color: C.text,
              border: `1px solid ${C.border}`, borderRadius: RADII.sm,
              fontSize: 13, textDecoration: 'none'
            }}
          >📋 Handout</Link>
          <button
            onClick={startRun}
            style={{
              padding: '8px 14px', background: C.primary, color: '#fff',
              border: 'none', borderRadius: RADII.sm, fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >▶ Starten</button>
        </div>
      </div>

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
        <TimelineBlocks totalMinutes={duration} segments={blocks.map((b) => ({ name: b.title, color: focusAreas.find((f) => f.id === b.categoryId)?.colorHex ?? C.primary, minutes: b.durationMinutes }))} />

        {schwerpunkteAb.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Abgeleitete Schwerpunkte:</span>
            {schwerpunkteAb.map((s) => <SchwerpunktBadge key={s.faId} focus={focusAreas.find((f) => f.id === s.faId)} />)}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          {blocks.length === 0 && <div style={{ color: C.textMuted, padding: 12, textAlign: 'center' }}>Noch keine Blöcke. Füge einen Block aus der Bibliothek hinzu oder erstelle einen eigenen.</div>}
          {blocks.map((b, i) => {
            const focus = focusAreas.find((f) => f.id === b.categoryId);
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
                    <Badge bg={focus?.colorHex + '22'} fg={focus?.colorHex}>{focus?.name ?? '—'}</Badge>
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
          <button onClick={() => setShowSaveToLib(true)} style={{ padding: '8px 12px', background: C.success + '12', color: C.success, border: `1px solid ${C.success}33`, borderRadius: RADII.sm, fontSize: 12 }}>💾 In Bibliothek speichern</button>
          <button onClick={deleteUnit} style={{ padding: '8px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: RADII.sm, fontSize: 12, marginLeft: 'auto' }}>🗑 Einheit löschen</button>
        </div>
      </Card>

      <DirtyFlagSaveButton isDirty={isDirty} onSave={saveUnit} />

      <BibliothekPicker open={showLibrary} onClose={() => setShowLibrary(false)} onPick={async (entries) => {
        let added = 0;
        for (const e of entries) {
          const wb = e.type === 'Workout' ? libraryRepo.workoutBlocks(e.id) : [];
          if (wb.length > 0) {
            // Workout expandiert zu N Blöcken (Reihenfolge bleibt erhalten).
            for (const b of wb) {
              await blocksRepo.upsert({
                trainingUnitId: unit.id, title: b.title, categoryId: b.categoryId,
                durationMinutes: b.durationMinutes, iconEmoji: b.iconEmoji, note: b.note,
                source: 'library', sourceLibraryEntryId: e.id
              });
              added++;
            }
          } else {
            // Übung/Spiel oder Workout ohne Blöcke -> ein Block wie bisher.
            await blocksRepo.upsert({
              trainingUnitId: unit.id, title: e.title, categoryId: e.categoryId,
              durationMinutes: e.durationMinutes, source: 'library', sourceLibraryEntryId: e.id
            });
            added++;
          }
        }
        refresh(); setShowLibrary(false); toast(`${added} Block(s) hinzugefügt`);
      }} />
      {showNewBlock && <BlockDialog onClose={() => setShowNewBlock(false)} onSave={async (b) => {
        await blocksRepo.upsert({ trainingUnitId: unit.id, ...b, source: 'custom' }); refresh();
      }} />}
      {editBlock && <BlockDialog block={editBlock} onClose={() => setEditBlock(null)} onSave={async (b) => {
        await blocksRepo.upsert({ id: editBlock.id, trainingUnitId: unit.id, source: editBlock.source, sourceLibraryEntryId: editBlock.sourceLibraryEntryId ?? null, ...b }); refresh();
      }} />}
      {showSaveToLib && <SaveToLibDialog unitId={unit.id} blocks={blocks} onClose={() => setShowSaveToLib(false)} />}
    </div>
  );
}

function BlockDialog({ block, onClose, onSave }: { block?: TrainingBlock; onClose: () => void; onSave: (b: { title: string; categoryId: string; durationMinutes: number; iconEmoji?: string | null; note?: string | null }) => void }) {
  const { focusAreas } = useData();
  const [title, setTitle] = useState(block?.title ?? '');
  const [catId, setCatId] = useState(block?.categoryId ?? focusAreas[0]?.id);
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
            {focusAreas.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
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
  const { library, focusAreas } = useData();
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [sel, setSel] = useState<Record<string, boolean>>({});
  const filtered = library.filter((e) => (!cat || e.categoryId === cat) && (!q || e.title.toLowerCase().includes(q.toLowerCase())));
  const selected = Object.keys(sel).filter((k) => sel[k]).map((id) => library.find((l) => l.id === id)!).filter(Boolean);

  return (
    <BottomSheet open={open} onClose={onClose} title="Bibliothek">
      <input placeholder="Suche …" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 8 }} />
      <select style={{ ...inputStyle, width: '100%', marginBottom: 8 }} value={cat} onChange={(e) => setCat(e.target.value)}>
        <option value="">Alle Kategorien</option>
        {focusAreas.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      {filtered.length === 0 && <div style={{ color: C.textMuted, textAlign: 'center', padding: 20 }}>Keine Einträge.</div>}
      {filtered.map((e) => {
        const blockCount = e.type === 'Workout' ? libraryRepo.workoutBlocks(e.id).length : 0;
        return (
          <div key={e.id} onClick={() => setSel({ ...sel, [e.id]: !sel[e.id] })}
            style={{ padding: 10, marginBottom: 6, borderRadius: RADII.md, background: sel[e.id] ? C.primary + '12' : C.bg, border: sel[e.id] ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>{e.title}</span>
              {blockCount > 0 && <Badge bg={C.primary + '22'} fg={C.primary}>🧩 {blockCount} Blöcke</Badge>}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{focusAreas.find((f) => f.id === e.categoryId)?.name} · {e.niveau} · {e.durationMinutes} min</div>
          </div>
        );
      })}
      {selected.length > 0 && (
        <button onClick={() => onPick(selected)} style={{ position: 'sticky', bottom: 0, width: '100%', padding: '12px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.md, fontWeight: 600, marginTop: 10 }}>
          {selected.length} Eintrag(e) übernehmen
        </button>
      )}
    </BottomSheet>
  );
}

function SaveToLibDialog({ unitId, blocks, onClose }: { unitId: string; blocks: TrainingBlock[]; onClose: () => void }) {
  const { focusAreas, reload } = useData();
  const [title, setTitle] = useState('');
  const total = blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const cats = Array.from(new Set(blocks.map((b) => focusAreas.find((f) => f.id === b.categoryId)?.name).filter(Boolean)));
  // Anforderung 3: Ein Workout muss aus mindestens 2 Blöcken bestehen.
  const enoughBlocks = blocks.length >= 2;
  const canSave = !!title.trim() && enoughBlocks;

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 400, maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>In Bibliothek speichern</h3>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Vorschau: {blocks.length} Blöcke · {total} min · {cats.join(', ')}</div>
        {!enoughBlocks && (
          <div style={{ fontSize: 12, color: C.danger, background: C.danger + '12', border: `1px solid ${C.danger}33`, borderRadius: RADII.sm, padding: 8, marginBottom: 10 }}>
            Ein Workout muss aus mindestens 2 Blöcken bestehen. Füge weitere Blöcke zur Einheit hinzu.
          </div>
        )}
        <Field label="Titel *"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Hiit 90 min" /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!canSave} onClick={async () => {
            const catId = blocks[0]?.categoryId ?? focusAreas[0]?.id;
            // 1) Summen-Eintrag (Cache der Gesamtdauer für die Listen-Anzeige).
            const entry = await libraryRepo.upsert({ type: 'Workout', title: title.trim(), categoryId: catId, niveau: 'Mittelstufe', durationMinutes: total, source: 'from_planning', createdFromUnitId: unitId });
            // 2) Einzelne Blöcke der Einheit reihenfolge-erhaltend übernehmen
            //    (ein Bulk-insert wegen des deferred >=2-Blöcke-Triggers).
            await libraryRepo.setWorkoutBlocks(entry.id, blocks.map((b) => ({
              title: b.title, categoryId: b.categoryId, durationMinutes: b.durationMinutes,
              iconEmoji: b.iconEmoji, note: b.note
            })));
            reload('library');
            toast('In Bibliothek gespeichert'); onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.success : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Speichern</button>
        </div>
      </div>
    </div>
  );
}
