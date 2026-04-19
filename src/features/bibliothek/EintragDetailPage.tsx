import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { TabBar } from '@/components/ui/TabBar';
import { Field, inputStyle } from '@/components/ui/Field';
import { DirtyFlagSaveButton } from '@/components/ui/DirtyFlagSaveButton';
import { Badge } from '@/components/ui/Badge';
import { confirmDialog } from '@/components/ui/ConfirmDialog';
import { C, RADII, TYP_FARBEN, LIBRARY_TYPEN, LIBRARY_NIVEAUS } from '@/design/tokens';
import { useData, libraryRepo } from '@/state/dataStore';
import { toast } from '@/state/uiStore';
import type { LibraryNiveau, LibraryTyp } from '@/domain/types';

type Tab = 'uebersicht' | 'anleitung' | 'medien' | 'timer';

export default function EintragDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { library, reload } = useData();
  const entry = library.find((e) => e.id === id);
  const timer = entry ? libraryRepo.timer(entry.id) : { config: null, phases: [] };
  const [tab, setTab] = useState<Tab>('uebersicht');
  if (!entry) return <div style={{ padding: 30, textAlign: 'center' }}>Eintrag nicht gefunden · <Link to="/bibliothek">Zurück</Link></div>;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Link to="/bibliothek" style={{ color: C.textMuted, textDecoration: 'none' }}>← Bibliothek</Link>
      <Card style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <Badge bg={TYP_FARBEN[entry.type] + '22'} fg={TYP_FARBEN[entry.type]}>{entry.type}</Badge>
          <Badge bg={C.bg} fg={C.textMuted}>{entry.niveau}</Badge>
        </div>
        <h2 style={{ margin: 0 }}>{entry.title}</h2>
      </Card>
      <div style={{ marginTop: 12 }}>
        <TabBar<Tab>
          tabs={[{ id: 'uebersicht', label: 'Übersicht' }, { id: 'anleitung', label: 'Anleitung' }, { id: 'medien', label: 'Medien' }, ...(timer.config?.active ? [{ id: 'timer' as Tab, label: '⏱ Timer' }] : [])]}
          active={tab} onChange={setTab}
        />
      </div>
      {tab === 'uebersicht' && <TabUebersicht entry={entry} onSaved={() => reload('library')} onDelete={async () => {
        if (!(await confirmDialog({ title: 'Eintrag löschen?', body: 'Der Bibliothekseintrag wird entfernt.', tone: 'danger', confirmLabel: 'Löschen' }))) return;
        libraryRepo.remove(entry.id); reload('library'); nav('/bibliothek');
      }} />}
      {tab === 'anleitung' && <TabAnleitung entryId={entry.id} />}
      {tab === 'medien' && <TabMedien entry={entry} onSaved={() => reload('library')} />}
      {tab === 'timer' && <TabTimer entryId={entry.id} />}
    </div>
  );
}

function TabUebersicht({ entry, onSaved, onDelete }: { entry: any; onSaved: () => void; onDelete: () => void }) {
  const { blockCategories } = useData();
  const [title, setTitle] = useState(entry.title);
  const [type, setType] = useState<LibraryTyp>(entry.type);
  const [catId, setCatId] = useState(entry.categoryId);
  const [niveau, setNiveau] = useState<LibraryNiveau>(entry.niveau);
  const [description, setDescription] = useState(entry.description ?? '');
  const [dur, setDur] = useState(entry.durationMinutes);
  const isDirty = title !== entry.title || type !== entry.type || catId !== entry.categoryId || niveau !== entry.niveau || description !== (entry.description ?? '') || dur !== entry.durationMinutes;

  const [materials, setMaterials] = useState(libraryRepo.materials(entry.id));
  const [matTxt, setMatTxt] = useState('');

  return (
    <>
      <Card>
        <Field label="Titel"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Typ">
          <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value as LibraryTyp)}>
            {LIBRARY_TYPEN.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
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
      </Card>
      <Card style={{ marginTop: 10 }}>
        <h3 style={{ margin: '0 0 10px' }}>Material</h3>
        {materials.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6 }}>
            <span style={{ flex: 1 }}>☐ {m.text}</span>
            <button onClick={() => { libraryRepo.setMaterials(entry.id, materials.filter((x) => x.id !== m.id).map((x) => x.text)); setMaterials(libraryRepo.materials(entry.id)); }} style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input value={matTxt} onChange={(e) => setMatTxt(e.target.value)} placeholder="Material hinzufügen …" style={{ ...inputStyle, flex: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter' && matTxt.trim()) { const all = [...materials.map((m) => m.text), matTxt.trim()]; libraryRepo.setMaterials(entry.id, all); setMaterials(libraryRepo.materials(entry.id)); setMatTxt(''); } }}
          />
          <button onClick={() => { if (matTxt.trim()) { libraryRepo.setMaterials(entry.id, [...materials.map((m) => m.text), matTxt.trim()]); setMaterials(libraryRepo.materials(entry.id)); setMatTxt(''); } }} style={{ padding: '0 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+</button>
        </div>
      </Card>
      <Card style={{ marginTop: 10 }}>
        <button onClick={onDelete} style={{ padding: '8px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}33`, borderRadius: RADII.sm, fontSize: 12 }}>🗑 Eintrag löschen</button>
      </Card>
      <DirtyFlagSaveButton isDirty={isDirty} onSave={() => {
        libraryRepo.upsert({ id: entry.id, type, title, categoryId: catId, niveau, description: description || null, durationMinutes: dur });
        toast('Eintrag gespeichert'); onSaved();
      }} />
    </>
  );
}

function TabAnleitung({ entryId }: { entryId: string }) {
  const [steps, setSteps] = useState(libraryRepo.steps(entryId));
  const [txt, setTxt] = useState('');
  const save = (newSteps: { stepNumber: number; text: string }[]) => { libraryRepo.setSteps(entryId, newSteps); setSteps(libraryRepo.steps(entryId)); };
  return (
    <Card>
      <h3 style={{ margin: '0 0 10px' }}>Schritt-für-Schritt</h3>
      {steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 10, padding: 10, background: C.bg, borderRadius: RADII.md, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{s.stepNumber}</div>
          <span style={{ flex: 1 }}>{s.text}</span>
          <button onClick={() => save(steps.filter((_, idx) => idx !== i).map((x, idx) => ({ stepNumber: idx + 1, text: x.text })))} style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Schritt hinzufügen …" style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => { if (e.key === 'Enter' && txt.trim()) { save([...steps.map((s) => ({ stepNumber: s.stepNumber, text: s.text })), { stepNumber: steps.length + 1, text: txt.trim() }]); setTxt(''); } }} />
        <button onClick={() => { if (txt.trim()) { save([...steps.map((s) => ({ stepNumber: s.stepNumber, text: s.text })), { stepNumber: steps.length + 1, text: txt.trim() }]); setTxt(''); } }} style={{ padding: '0 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm }}>+</button>
      </div>
    </Card>
  );
}

function TabMedien({ entry, onSaved }: { entry: any; onSaved: () => void }) {
  const [yt, setYt] = useState(entry.youtubeVideoId ?? '');
  const isDirty = yt !== (entry.youtubeVideoId ?? '');

  const extract = (v: string): string => {
    const m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return m ? m[1] : v.trim();
  };

  return (
    <Card>
      <Field label="YouTube-URL oder Video-ID">
        <input style={inputStyle} value={yt} onChange={(e) => setYt(e.target.value)} placeholder="https://youtu.be/..." />
      </Field>
      {entry.youtubeVideoId && (
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: RADII.md, overflow: 'hidden', marginTop: 10 }}>
          <iframe src={`https://www.youtube.com/embed/${entry.youtubeVideoId}`} title="Video" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen />
        </div>
      )}
      <DirtyFlagSaveButton isDirty={isDirty} onSave={() => {
        libraryRepo.upsert({ id: entry.id, type: entry.type, title: entry.title, categoryId: entry.categoryId, niveau: entry.niveau, youtubeVideoId: yt ? extract(yt) : null, description: entry.description, durationMinutes: entry.durationMinutes });
        onSaved(); toast('Video gespeichert');
      }} />
    </Card>
  );
}

function TabTimer({ entryId }: { entryId: string }) {
  const timer = libraryRepo.timer(entryId);
  const [phases, setPhases] = useState(timer.phases.length ? timer.phases : [{ id: 'a', libraryEntryId: entryId, name: 'Arbeit', durationSeconds: 30, colorHex: C.danger, sortOrder: 0 }]);
  const [reps, setReps] = useState(timer.config?.repetitions ?? 3);
  const [running, setRunning] = useState(false);
  const [curPhase, setCurPhase] = useState(0);
  const [curRep, setCurRep] = useState(1);
  const [remaining, setRemaining] = useState(phases[0]?.durationSeconds ?? 30);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setCurPhase((p) => {
          if (p + 1 < phases.length) { setRemaining(phases[p + 1].durationSeconds); return p + 1; }
          if (curRep < reps) { setCurRep((x) => x + 1); setRemaining(phases[0].durationSeconds); return 0; }
          setRunning(false); return p;
        });
        return 0;
      });
    }, 1000) as unknown as number;
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phases, reps, curRep]);

  const total = phases.reduce((s, p) => s + p.durationSeconds, 0) * reps;
  const pct = phases[curPhase] ? ((phases[curPhase].durationSeconds - remaining) / phases[curPhase].durationSeconds) * 100 : 0;

  const savePhases = () => {
    libraryRepo.setTimer(entryId, { active: true, repetitions: reps }, phases.map((p) => ({ name: p.name, durationSeconds: p.durationSeconds, colorHex: p.colorHex })));
    toast('Timer gespeichert');
  };

  return (
    <Card>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
            <circle cx={50} cy={50} r={45} fill="none" stroke={C.bg} strokeWidth={8} />
            <circle cx={50} cy={50} r={45} fill="none" stroke={phases[curPhase]?.colorHex ?? C.primary} strokeWidth={8}
              strokeDasharray={`${pct * 2.827} 282.7`} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 300ms' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: phases[curPhase]?.colorHex }}>{remaining}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{phases[curPhase]?.name} · Runde {curRep}/{reps}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={() => setRunning(!running)} style={{ padding: '10px 20px', background: running ? C.warn : C.success, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>{running ? '⏸ Pause' : '▶ Start'}</button>
          <button onClick={() => { setRunning(false); setCurPhase(0); setCurRep(1); setRemaining(phases[0]?.durationSeconds ?? 0); }} style={{ padding: '10px 20px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>⟲ Reset</button>
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>Gesamt: {Math.floor(total / 60)}:{String(total % 60).padStart(2, '0')}</div>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 10 }}>
        <h4 style={{ margin: '0 0 10px' }}>Konfiguration</h4>
        <Field label="Wiederholungen"><input type="number" min={1} max={10} style={inputStyle} value={reps} onChange={(e) => setReps(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} /></Field>
        {phases.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={p.name} onChange={(e) => setPhases((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
            <input type="number" min={5} max={600} style={{ ...inputStyle, width: 90 }} value={p.durationSeconds} onChange={(e) => setPhases((prev) => prev.map((x, idx) => idx === i ? { ...x, durationSeconds: Math.max(5, Math.min(600, Number(e.target.value) || 5)) } : x))} />
            <input type="color" style={{ width: 48, height: 40, border: 'none', background: 'transparent' }} value={p.colorHex} onChange={(e) => setPhases((prev) => prev.map((x, idx) => idx === i ? { ...x, colorHex: e.target.value } : x))} />
            <button onClick={() => setPhases((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: C.danger }}>🗑</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => setPhases((prev) => [...prev, { id: 'new-' + prev.length, libraryEntryId: entryId, name: 'Neue Phase', durationSeconds: 30, colorHex: C.primary, sortOrder: prev.length }])} style={{ padding: '8px 14px', background: C.bg, border: 'none', borderRadius: RADII.sm }}>+ Phase</button>
          <button onClick={savePhases} style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: RADII.sm, fontWeight: 600 }}>Speichern</button>
        </div>
      </div>
    </Card>
  );
}
