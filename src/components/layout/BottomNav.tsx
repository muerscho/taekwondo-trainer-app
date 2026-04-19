import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig';
import { C, RADII } from '@/design/tokens';
import { useUIStore } from '@/state/uiStore';

export function BottomNav() {
  const openDrawer = useUIStore((s) => s.setDrawer);
  const primary = NAV.filter((n) => n.primary);
  return (
    <nav aria-label="Hauptnavigation" style={{
      position: 'sticky', bottom: 0, display: 'flex',
      background: C.surface, borderTop: `1px solid ${C.border}`, zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom, 0)'
    }}>
      {primary.map((n) => (
        <NavLink key={n.id} to={n.path}
          style={({ isActive }) => ({
            flex: 1, padding: '10px 4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? C.primary : C.textMuted,
            fontSize: 10, fontWeight: isActive ? 700 : 500,
            textDecoration: 'none', borderRadius: RADII.sm
          })}
        >
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          {n.label}
        </NavLink>
      ))}
      <button onClick={() => openDrawer(true)} aria-label="Mehr" style={{
        flex: 1, background: 'transparent', border: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        color: C.textMuted, fontSize: 10
      }}>
        <span style={{ fontSize: 20 }}>☰</span>
        Mehr
      </button>
    </nav>
  );
}
