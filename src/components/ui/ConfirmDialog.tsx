import { useState } from 'react';
import { C, RADII, SHADOWS } from '@/design/tokens';

interface ConfirmState {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  tone: 'danger' | 'primary';
  resolve?: (v: boolean) => void;
}
let setter: ((s: ConfirmState) => void) | null = null;

export function confirmDialog(opts: { title: string; body: string; confirmLabel?: string; tone?: 'danger' | 'primary' }): Promise<boolean> {
  return new Promise((resolve) => {
    setter?.({ open: true, title: opts.title, body: opts.body, confirmLabel: opts.confirmLabel ?? 'OK', tone: opts.tone ?? 'primary', resolve });
  });
}

export function ConfirmHost() {
  const [s, setS] = useState<ConfirmState>({ open: false, title: '', body: '', confirmLabel: 'OK', tone: 'primary' });
  setter = setS;
  if (!s.open) return null;
  const done = (v: boolean) => { s.resolve?.(v); setS({ ...s, open: false }); };
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => done(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: RADII.lg, padding: 20, maxWidth: 400, width: '90%', boxShadow: SHADOWS.modal }}>
        <h3 style={{ margin: '0 0 8px' }}>{s.title}</h3>
        <p style={{ margin: '0 0 16px', color: C.textMuted }}>{s.body}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => done(false)} style={{ padding: '8px 14px', border: `1px solid ${C.border}`, background: C.surface, borderRadius: RADII.sm }}>Abbrechen</button>
          <button onClick={() => done(true)} style={{ padding: '8px 14px', border: 'none', background: s.tone === 'danger' ? C.danger : C.primary, color: '#fff', borderRadius: RADII.sm, fontWeight: 600 }}>{s.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
