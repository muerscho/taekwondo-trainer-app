import { ReactNode } from 'react';
import { C, RADII } from '@/design/tokens';

export function EmptyState({ icon = '📭', title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: RADII.lg, color: C.textMuted }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: C.text, marginTop: 8 }}>{title}</div>
      {body && <div style={{ marginTop: 4, fontSize: 13 }}>{body}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
