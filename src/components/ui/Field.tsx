import { ReactNode, CSSProperties } from 'react';
import { C, RADII } from '@/design/tokens';

export function Field({ label, hint, children, style }: { label: string; hint?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, fontSize: 12, ...style }}>
      <span style={{ fontWeight: 600, color: C.text }}>{label}</span>
      {children}
      {hint && <span style={{ color: C.textMuted, fontSize: 11 }}>{hint}</span>}
    </label>
  );
}

export const inputStyle: CSSProperties = {
  padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: RADII.sm,
  background: C.surface, fontSize: 14, outline: 'none'
};
