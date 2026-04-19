import { C, RADII } from '@/design/tokens';

export function TabBar<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, background: C.bg, padding: 4, borderRadius: RADII.md, marginBottom: 12, overflowX: 'auto' }} role="tablist">
      {tabs.map((t) => {
        const a = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={a}
            onClick={() => onChange(t.id)}
            style={{
              flex: '1 1 auto', minWidth: 'fit-content',
              padding: '8px 12px', border: 'none', borderRadius: RADII.sm,
              background: a ? C.surface : 'transparent',
              fontWeight: a ? 700 : 500,
              color: a ? C.primary : C.textMuted,
              boxShadow: a ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >{t.label}</button>
        );
      })}
    </div>
  );
}
