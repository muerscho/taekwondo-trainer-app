import { ReactNode, useEffect } from 'react';
import { C, RADII } from '@/design/tokens';

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 720, maxHeight: '85vh',
        background: C.surface, borderRadius: `${RADII.xl}px ${RADII.xl}px 0 0`,
        padding: 16, overflowY: 'auto', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ width: 40, height: 4, background: C.borderStrong, borderRadius: 2, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
          <button onClick={onClose} aria-label="Schließen" style={{ background: 'transparent', border: 'none', fontSize: 20, color: C.textMuted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
