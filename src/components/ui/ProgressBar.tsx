import { C } from '@/design/tokens';

export function ProgressBar({ value, color = C.primary, height = 8 }: { value: number; color?: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ background: C.bg, borderRadius: 999, overflow: 'hidden', height }}>
      <div style={{ width: `${v}%`, height: '100%', background: color, transition: 'width 300ms ease' }} />
    </div>
  );
}
