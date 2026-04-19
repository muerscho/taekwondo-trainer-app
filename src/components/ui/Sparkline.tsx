export function Sparkline({ series, width = 240, height = 48 }: { series: { color: string; points: number[] }[]; width?: number; height?: number }) {
  const max = Math.max(1, ...series.flatMap((s) => s.points));
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {series.map((s, i) => {
        const n = s.points.length;
        const stepX = n > 1 ? width / (n - 1) : width;
        const d = s.points.map((p, idx) => {
          const x = idx * stepX;
          const y = height - (p / max) * (height - 6) - 3;
          return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        return <path key={i} d={d} stroke={s.color} strokeWidth={2} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
}
