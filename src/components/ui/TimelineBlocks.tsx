import { C } from '@/design/tokens';

export function TimelineBlocks({ segments, totalMinutes, height = 10 }: {
  segments: { name: string; color: string; minutes: number }[];
  totalMinutes: number;
  height?: number;
}) {
  const used = segments.reduce((s, x) => s + x.minutes, 0);
  const scale = Math.max(totalMinutes, used) || 1;
  const over = used > totalMinutes;
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: C.bg, border: over ? `1px solid ${C.danger}` : 'none' }}>
      {segments.map((s, i) => (
        <div key={i} title={`${s.name}: ${s.minutes} min`} style={{ width: `${(s.minutes / scale) * 100}%`, background: s.color }} />
      ))}
      {used < totalMinutes && <div style={{ flex: 1, background: 'transparent' }} />}
    </div>
  );
}
