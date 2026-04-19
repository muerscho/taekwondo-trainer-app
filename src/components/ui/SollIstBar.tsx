import { C } from '@/design/tokens';

export function SollIstBar({ soll, ist, color, label, compact }: { soll: number; ist: number; color: string; label?: string; compact?: boolean }) {
  const diff = Math.round(ist - soll);
  const diffColor = Math.abs(diff) <= 3 ? C.success : diff < 0 ? C.danger : C.warn;
  const pct = Math.max(0, Math.min(100, ist));
  return (
    <div style={{ marginBottom: compact ? 6 : 10 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{label}</span>
          <span style={{ color: C.textMuted }}>
            {ist}% <span style={{ color: diffColor, fontWeight: 700 }}>({diff >= 0 ? '+' : ''}{diff})</span>
          </span>
        </div>
      )}
      <div style={{ position: 'relative', height: compact ? 6 : 10, background: C.bg, borderRadius: 999 }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 300ms ease' }} />
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `calc(${Math.min(100, soll)}% - 1px)`, width: 2, background: C.text, opacity: 0.6 }} title={`Soll ${soll}%`} />
      </div>
    </div>
  );
}
