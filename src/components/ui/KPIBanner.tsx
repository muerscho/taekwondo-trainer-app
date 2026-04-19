import { ReactNode } from 'react';
import { C, RADII, SHADOWS } from '@/design/tokens';

export function KPIBanner({ items }: { items: Array<{ label: string; value: ReactNode; color?: string }> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10, marginBottom: 14 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: C.surface, padding: 12, borderRadius: RADII.md, boxShadow: SHADOWS.card, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: it.color ?? C.primary }}>{it.value}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}
