import { C } from '@/design/tokens';

export function DonutChart({ data, size = 180, thickness = 28 }: { data: { name: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.bg} strokeWidth={thickness} />
      {data.map((d) => {
        const frac = d.value / total;
        const dash = frac * 2 * Math.PI * r;
        const gap = 2 * Math.PI * r - dash;
        const rot = -90 + (acc / total) * 360;
        acc += d.value;
        return (
          <circle
            key={d.name} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rot} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 400ms ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fontWeight={700} fill={C.text}>{Math.round((data.find((d) => d.value) ? total : 0))}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill={C.textMuted}>Minuten</text>
    </svg>
  );
}
