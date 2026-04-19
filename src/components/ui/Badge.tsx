import { CSSProperties, ReactNode } from 'react';
import { C, RADII } from '@/design/tokens';

export function Badge(props: { children: ReactNode; bg?: string; fg?: string; border?: string; style?: CSSProperties }) {
  const { children, bg = C.bg, fg = C.text, border, style } = props;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
      borderRadius: RADII.pill, background: bg, color: fg,
      border: border ? `1px solid ${border}` : 'none',
      whiteSpace: 'nowrap', ...style
    }}>{children}</span>
  );
}
