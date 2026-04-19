import { useUIStore } from '@/state/uiStore';
import { C, RADII, SHADOWS } from '@/design/tokens';

const BG = {
  info: C.info, success: C.success, warn: C.warn, error: C.danger
};

export function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <div style={{ position: 'fixed', bottom: 80, left: 0, right: 0, zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" style={{
          pointerEvents: 'auto',
          background: BG[t.kind], color: '#fff',
          padding: '10px 16px', borderRadius: RADII.pill,
          boxShadow: SHADOWS.modal, fontSize: 13, fontWeight: 600,
          maxWidth: '90vw'
        }}>{t.text}</div>
      ))}
    </div>
  );
}
