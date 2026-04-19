import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Field, inputStyle } from '@/components/ui/Field';
import { C, RADII, TYP_FARBEN, LIBRARY_TYPEN, LIBRARY_NIVEAUS } from '@/design/tokens';
import { useData, libraryRepo } from '@/state/dataStore';
import { toast } from '@/state/uiStore';
import type { LibraryNiveau, LibraryTyp } from '@/domain/types';

export default function BibliothekListePage() {
  const { library, blockCategories, reload } = useData();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [niveau, setNiveau] = useState('');
  const [showNew, setShowNew] = useState(false);

  const filtered = library.filter((e) => (!cat || e.categoryId === cat) && (!niveau || e.niveau === niveau) && (!q || e.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Titel suchen …" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle, flex: '1 1 200px' }} />
        <select style={{ ...inputStyle, minWidth: 140 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Kategorie</option>
          {blockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={{ ...inputStyle, minWidth: 140 }} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
          <option value="">Niveau</option>
          {LIBRARY_NIVEAUS.map((n) => <option key={n}>{n}</option>)}
        </select>
        <button onClick={() => setShowNew(true)} style={{ padding: '10px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+ Neuer Eintrag</button>
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>{filtered.length} Einträge</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {filtered.map((e) => {
          const cat = blockCategories.find((c) => c.id === e.categoryId);
          const typColor = TYP_FARBEN[e.type] ?? C.primary;
          const timer = libraryRepo.timer(e.id);
          return (
            <Link key={e.id} to={`/bibliothek/${e.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <Badge bg={typColor + '22'} fg={typColor}>{e.type}</Badge>
                  <Badge bg={C.bg} fg={C.textMuted}>{cat?.name ?? '—'}</Badge>
                  <Badge bg={C.bg} fg={C.textMuted}>{e.niveau}</Badge>
                  {timer.config?.active && <Badge bg={C.warn + '22'} fg={C.warn}>⏱ Timer</Badge>}
                  {e.youtubeVideoId && <Badge bg={C.danger + '22'} fg={C.danger}>▶ Video</Badge>}
                  {e.source === 'from_planning' && <Badge bg={C.primary + '22'} fg={C.primary}>📅 Aus Planung</Badge>}
                </div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{e.durationMinutes} min</div>
              </Card>
            </Link>
          );
        })}
      </div>
      {showNew && <NeuerEintragDialog onClose={() => { setShowNew(false); reload('library'); }} />}
    </div>
  );
}

function NeuerEintragDialog({ onClose }: { onClose: () => void }) {
  const { blockCategories } = useData();
  const [type, setType] = useState<LibraryTyp>('Übung');
  const [title, setTitle] = useState('');
  const [catId, setCatId] = useState(blockCategories[0]?.id ?? '');
  const [niveau, setNiveau] = useState<LibraryNiveau>('Mittelstufe');
  const [description, setDescription] = useState('');
  const [dur, setDur] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const canSave = title.trim() && catId;
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, width: 440, maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Neuer Bibliothekseintrag</h3>
        <Field label="Typ">
          <div style={{ display: 'flex', gap: 6 }}>
            {LIBRARY_TYPEN.map((t) => (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: 10, borderRadius: RADII.sm, border: 'none', background: type === t ? TYP_FARBEN[t] : C.bg, color: type === t ? '#fff' : C.text }}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Titel *"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Kategorie">
          <select style={inputStyle} value={catId} onChange={(e) => setCatId(e.target.value)}>
            {blockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Niveau">
          <select style={inputStyle} value={niveau} onChange={(e) => setNiveau(e.target.value as LibraryNiveau)}>
            {LIBRARY_NIVEAUS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Dauer (min)"><input type="number" min={0} style={inputStyle} value={dur} onChange={(e) => setDur(Math.max(0, Number(e.target.value) || 0))} /></Field>
        <Field label="Beschreibung"><textarea style={{ ...inputStyle, minHeight: 80 }} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 10 }}>
          <input type="checkbox" checked={timerActive} onChange={(e) => setTimerActive(e.target.checked)} /> Intervall-Timer aktivieren
        </label>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>Abbrechen</button>
          <button disabled={!canSave} onClick={() => {
            const e = libraryRepo.upsert({ type, title: title.trim(), categoryId: catId, niveau, description: description || null, durationMinutes: dur });
            if (timerActive) libraryRepo.setTimer(e.id, { active: true, repetitions: 3 }, [
              { name: 'Arbeit', durationSeconds: 30, colorHex: C.danger },
              { name: 'Pause', durationSeconds: 15, colorHex: C.success }
            ]);
            toast('Eintrag angelegt'); onClose();
          }} style={{ padding: '8px 14px', background: canSave ? C.primary : C.borderStrong, color: '#fff', border: 'none', borderRadius: RADII.sm }}>Anlegen</button>
        </div>
      </div>
    </div>
  );
}
