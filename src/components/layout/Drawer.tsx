import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig';
import { useUIStore } from '@/state/uiStore';
import { C, RADII } from '@/design/tokens';

export function Drawer() {
  const open = useUIStore((s) => s.drawerOpen);
  const setOpen = useUIStore((s) => s.setDrawer);
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Alle Bereiche" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 280, height: '100%', background: C.surface, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 6
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Alle Bereiche</strong>
          <button aria-label="Schließen" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 22, color: C.textMuted }}>×</button>
        </div>
        {NAV.map((n) => (
          <NavLink key={n.id} to={n.path} onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              padding: '12px 10px', borderRadius: RADII.sm,
              background: isActive ? C.bg : 'transparent',
              color: isActive ? C.primary : C.text, textDecoration: 'none',
              fontWeight: isActive ? 700 : 500, display: 'flex', alignItems: 'center', gap: 10
            })}
          >
            <span style={{ fontSize: 20 }}>{n.icon}</span> {n.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
