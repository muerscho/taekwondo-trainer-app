import { FocusArea } from '@/domain/types';

export function SchwerpunktBadge({ focus }: { focus: FocusArea | undefined }) {
  if (!focus) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      background: focus.colorHex + '22', color: focus.colorHex,
      fontSize: 11, fontWeight: 600, border: `1px solid ${focus.colorHex}44`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: focus.colorHex }} />
      {focus.name}
    </span>
  );
}
