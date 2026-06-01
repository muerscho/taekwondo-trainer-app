import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { C, RADII } from '@/design/tokens';
import { useData, blocksRepo, libraryRepo, unitsRepo } from '@/state/dataStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useFullscreen } from '@/hooks/useFullscreen';
import { toast } from '@/state/uiStore';
import type { TrainingBlock } from '@/domain/types';

const STORAGE_KEY = (unitId: string) => `tkd:run:${unitId}`;

interface RunState {
  unitId: string;
  currentIdx: number;
  blockRemainingSec: number;
  totalElapsedSec: number;
  paused: boolean;
  actualByBlockId: Record<string, number>;
  savedAt: number;
}

function loadState(unitId: string): RunState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(unitId));
    if (!raw) return null;
    const s = JSON.parse(raw) as RunState;
    return s && s.unitId === unitId ? s : null;
  } catch { return null; }
}

function saveState(s: RunState): void {
  try { localStorage.setItem(STORAGE_KEY(s.unitId), JSON.stringify({ ...s, savedAt: Date.now() })); } catch {}
}

function clearStoredState(unitId: string): void {
  try { localStorage.removeItem(STORAGE_KEY(unitId)); } catch {}
}

function fmt(secAbs: number, withSign = false): string {
  const sign = secAbs < 0 ? '-' : (withSign ? '+' : '');
  const s = Math.abs(Math.floor(secAbs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${sign}${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function fmtRelTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export default function EinheitRunPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { groups, focusAreas, reload } = useData();
  const unit = id ? unitsRepo.get(id) : null;
  const blocks = useMemo<TrainingBlock[]>(() => unit ? blocksRepo.byUnit(unit.id) : [], [unit?.id]);

  const fs = useFullscreen();

  // Restore prompt
  const [restoreCandidate, setRestoreCandidate] = useState<RunState | null>(null);
  const [decided, setDecided] = useState(false);

  // Run state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [blockRemainingSec, setBlockRemainingSec] = useState(0);
  const [totalElapsedSec, setTotalElapsedSec] = useState(0);
  const [paused, setPaused] = useState(true);
  const [actualByBlockId, setActualByBlockId] = useState<Record<string, number>>({});
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Initialize: check localStorage for restore offer
  useEffect(() => {
    if (!unit) return;
    const stored = loadState(unit.id);
    if (stored) setRestoreCandidate(stored);
    else {
      initFresh();
      setDecided(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id]);

  const initFresh = () => {
    const first = blocks[0];
    setCurrentIdx(0);
    setBlockRemainingSec((first?.durationMinutes ?? 0) * 60);
    setTotalElapsedSec(0);
    setPaused(true);
    setActualByBlockId({});
    if (unit) clearStoredState(unit.id);
  };

  const applyRestore = (s: RunState) => {
    setCurrentIdx(s.currentIdx);
    setBlockRemainingSec(s.blockRemainingSec);
    setTotalElapsedSec(s.totalElapsedSec);
    setPaused(true); // resume always paused, trainer must press play
    setActualByBlockId(s.actualByBlockId ?? {});
  };

  // Wake lock during active run (after decision and not paused)
  useWakeLock(decided && !paused);

  // Persist on every change
  useEffect(() => {
    if (!decided || !unit) return;
    saveState({
      unitId: unit.id, currentIdx, blockRemainingSec, totalElapsedSec, paused, actualByBlockId,
      savedAt: Date.now()
    });
  }, [decided, unit?.id, currentIdx, blockRemainingSec, totalElapsedSec, paused, actualByBlockId]);

  // Drift-resistant tick (Date.now() based)
  const lastTickRef = useRef<number | null>(null);
  useEffect(() => {
    if (paused || !decided) { lastTickRef.current = null; return; }
    lastTickRef.current = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const last = lastTickRef.current ?? now;
      const dt = Math.max(0, Math.floor((now - last) / 1000));
      if (dt > 0) {
        lastTickRef.current = last + dt * 1000;
        setBlockRemainingSec((s) => s - dt);
        setTotalElapsedSec((s) => s + dt);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [paused, decided]);

  if (!unit) {
    return <div style={{ padding: 30, textAlign: 'center' }}>Einheit nicht gefunden · <Link to="/planung">Zurück</Link></div>;
  }
  if (blocks.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        <p>Diese Einheit hat noch keine Blöcke.</p>
        <Link to={`/planung/einheit/${unit.id}`}>Einheit bearbeiten</Link>
      </div>
    );
  }

  const group = groups.find((g) => g.id === unit.groupId);
  const totalSollSec = blocks.reduce((s, b) => s + b.durationMinutes * 60, 0);
  const currentBlock = blocks[currentIdx];
  const nextBlock = blocks[currentIdx + 1] ?? null;
  const focus = focusAreas.find((f) => f.id === currentBlock.categoryId); // categoryId = Schwerpunkt-ID (Migration 0004)
  const lib = currentBlock.sourceLibraryEntryId ? libraryRepo.get(currentBlock.sourceLibraryEntryId) : null;
  const steps = lib ? libraryRepo.steps(lib.id) : [];
  const materials = lib ? libraryRepo.materials(lib.id) : [];

  const blockSollSec = currentBlock.durationMinutes * 60;
  const overrun = blockRemainingSec < 0;
  const blockProgressPct = blockSollSec > 0 ? Math.min(100, Math.max(0, ((blockSollSec - blockRemainingSec) / blockSollSec) * 100)) : 0;

  const accentColor = focus?.colorHex ?? C.primary;
  const blockTimerColor = overrun ? C.danger : accentColor;

  const handleNext = () => {
    if (currentIdx >= blocks.length - 1) return;
    const consumedSec = Math.max(0, blockSollSec - blockRemainingSec);
    setActualByBlockId((m) => ({ ...m, [currentBlock.id]: consumedSec }));
    const next = blocks[currentIdx + 1];
    setCurrentIdx(currentIdx + 1);
    setBlockRemainingSec(next.durationMinutes * 60);
  };

  const handlePrev = () => {
    if (currentIdx <= 0) return;
    // Plan-Sprung; Block-Timer-Stand bleibt wie er ist (laut Spec A.03.09.14)
    setCurrentIdx(currentIdx - 1);
  };

  const handleEndConfirm = async (asDone: boolean) => {
    if (asDone) {
      await unitsRepo.upsert({
        id: unit.id, date: unit.date, groupId: unit.groupId,
        durationMinutes: unit.durationMinutes, status: 'durchgeführt', title: unit.title
      });
      toast('Einheit als durchgeführt markiert');
    } else {
      toast('Einheit abgebrochen');
    }
    clearStoredState(unit.id);
    if (fs.isFullscreen) fs.exit();
    nav(`/planung/einheit/${unit.id}`);
  };

  // Restore dialog
  if (restoreCandidate && !decided) {
    const ageMs = Date.now() - restoreCandidate.savedAt;
    const restoredBlock = blocks[restoreCandidate.currentIdx];
    return (
      <Overlay>
        <div style={{ background: C.surface, color: C.text, borderRadius: RADII.lg, padding: 24, maxWidth: 460, width: '90%' }}>
          <h2 style={{ margin: '0 0 8px' }}>Laufende Einheit fortsetzen?</h2>
          <p style={{ margin: '0 0 16px', color: C.textMuted }}>
            Letzter Stand vor {fmtRelTime(ageMs)}: Block {restoreCandidate.currentIdx + 1}/{blocks.length}
            {restoredBlock ? ` — „${restoredBlock.title}"` : ''}, gesamt {fmt(restoreCandidate.totalElapsedSec)}.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { initFresh(); setRestoreCandidate(null); setDecided(true); }}
              style={btnGhost}
            >Neu starten</button>
            <button
              onClick={() => { applyRestore(restoreCandidate); setRestoreCandidate(null); setDecided(true); }}
              style={btnPrimary}
            >Fortsetzen</button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Block {currentIdx + 1} / {blocks.length}</div>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {unit.title || 'Trainingseinheit'} · {group?.name ?? '—'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            Gesamt {fmt(totalElapsedSec)} <span style={{ color: '#6b7280' }}>/ {fmt(totalSollSec)}</span>
          </div>
          <button onClick={fs.toggle} title={fs.isFullscreen ? 'Vollbild verlassen' : 'Vollbild'} style={iconBtn}>
            {fs.isFullscreen ? '🗗' : '🗖'}
          </button>
          <button onClick={() => setConfirmEnd(true)} title="Beenden" style={iconBtn}>✕</button>
        </div>
      </div>

      {/* Block timer + content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 18px 18px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 32 }}>{currentBlock.iconEmoji ?? '📌'}</span>
          <h1 style={{ margin: 0, fontSize: 28, color: '#fff' }}>{currentBlock.title}</h1>
        </div>
        {focus && (
          <div style={{ fontSize: 12, color: focus.colorHex, marginBottom: 18, fontWeight: 600 }}>
            ● {focus.name}
          </div>
        )}

        <div style={{
          fontSize: 'clamp(96px, 22vw, 200px)',
          fontWeight: 800, lineHeight: 1, letterSpacing: -2,
          color: blockTimerColor, fontVariantNumeric: 'tabular-nums', margin: '8px 0 4px'
        }}>
          {fmt(blockRemainingSec)}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
          {overrun ? <span style={{ color: C.danger, fontWeight: 600 }}>Überschritten</span> : `Soll ${fmt(blockSollSec)}`}
        </div>

        <div style={{ width: 'min(640px, 92%)', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: 22 }}>
          <div style={{ height: '100%', width: `${blockProgressPct}%`, background: blockTimerColor, transition: 'width 250ms linear' }} />
        </div>

        <div style={{ width: 'min(720px, 100%)', color: '#e5e7eb' }}>
          {currentBlock.note && (
            <div style={{ fontSize: 14, fontStyle: 'italic', color: '#d1d5db', marginBottom: 10 }}>
              💡 {currentBlock.note}
            </div>
          )}
          {lib?.description && (
            <p style={{ fontSize: 14, marginTop: 0, marginBottom: 12 }}>{lib.description}</p>
          )}
          {steps.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Ablauf</div>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {steps.map((s) => <li key={s.id} style={{ marginBottom: 4 }}>{s.text}</li>)}
              </ol>
            </div>
          )}
          {materials.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Material</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {materials.map((m) => <li key={m.id}>{m.text}</li>)}
              </ul>
            </div>
          )}
          {lib?.youtubeVideoId && (
            <a href={`https://www.youtube.com/watch?v=${lib.youtubeVideoId}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              ▶ Video auf YouTube öffnen
            </a>
          )}
        </div>
      </div>

      {/* Next preview */}
      {nextBlock && (
        <div style={{ padding: '8px 18px', borderTop: `1px solid rgba(255,255,255,0.08)`, background: 'rgba(255,255,255,0.02)', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Nächster: <span style={{ color: '#e5e7eb' }}>{nextBlock.iconEmoji ?? '📌'} {nextBlock.title}</span> · {nextBlock.durationMinutes} min
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 18px', borderTop: `1px solid rgba(255,255,255,0.08)`, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          style={{ ...ctrlBtn, opacity: currentIdx === 0 ? 0.4 : 1, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
        >◀ Zurück</button>
        <button
          onClick={() => setPaused((p) => !p)}
          style={{ ...ctrlBtn, background: paused ? C.success : C.warn, color: '#fff', minWidth: 140 }}
        >{paused ? '▶ Start / Weiter' : '⏸ Pause'}</button>
        <button
          onClick={handleNext}
          disabled={currentIdx >= blocks.length - 1}
          style={{ ...ctrlBtn, opacity: currentIdx >= blocks.length - 1 ? 0.4 : 1, cursor: currentIdx >= blocks.length - 1 ? 'not-allowed' : 'pointer' }}
        >Nächster ▶</button>
        <button onClick={() => setConfirmEnd(true)} style={{ ...ctrlBtn, background: 'transparent', border: `1px solid rgba(255,255,255,0.2)`, color: '#fca5a5' }}>
          Beenden
        </button>
      </div>

      {confirmEnd && (
        <Overlay zIndex={100002}>
          <div style={{ background: C.surface, color: C.text, borderRadius: RADII.lg, padding: 24, maxWidth: 420, width: '90%' }}>
            <h3 style={{ margin: '0 0 8px' }}>Einheit beenden</h3>
            <p style={{ margin: '0 0 16px', color: C.textMuted }}>
              Wie soll die Einheit abgeschlossen werden?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setConfirmEnd(false)} style={btnGhost}>Weiter trainieren</button>
              <button onClick={() => handleEndConfirm(false)} style={{ ...btnGhost, color: C.danger, borderColor: C.danger + '55' }}>Abbrechen</button>
              <button onClick={() => handleEndConfirm(true)} style={{ ...btnPrimary, background: C.success }}>Durchgeführt</button>
            </div>
          </div>
        </Overlay>
      )}
    </Overlay>
  );
}

function Overlay({ children, zIndex = 100000 }: { children: React.ReactNode; zIndex?: number }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex,
      background: '#0b0f17', color: '#fff',
      display: 'flex', flexDirection: 'column'
    }}>
      {children}
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
const ctrlBtn: React.CSSProperties = {
  padding: '12px 18px', borderRadius: RADII.md, border: `1px solid rgba(255,255,255,0.15)`,
  background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
};
const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: RADII.sm, border: `1px solid rgba(255,255,255,0.15)`,
  background: 'transparent', color: '#fff', cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center'
};
