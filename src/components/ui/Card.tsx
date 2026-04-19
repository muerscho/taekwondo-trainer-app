import { CSSProperties, ReactNode } from 'react';
import { C, RADII, SHADOWS } from '@/design/tokens';

export function Card(props: { children: ReactNode; style?: CSSProperties; onClick?: () => void; padding?: number | string }) {
  const { children, style, onClick, padding = 16 } = props;
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface,
        borderRadius: RADII.lg,
        boxShadow: SHADOWS.card,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </div>
  );
}
