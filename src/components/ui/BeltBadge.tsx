import { BeltRank } from '@/domain/types';

export function BeltBadge({ belt, size = 'md' }: { belt: BeltRank | undefined; size?: 'sm' | 'md' }) {
  if (!belt) return null;
  const h = size === 'sm' ? 18 : 22;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      background: belt.colorHex,
      border: `2px solid ${belt.colorBorderHex}`,
      color: belt.textColorHex ?? '#374151',
      borderRadius: 999,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 700,
      height: h
    }}>{belt.label}</span>
  );
}
