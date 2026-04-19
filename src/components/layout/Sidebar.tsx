import { NavLink } from 'react-router-dom';
import { NAV } from './navConfig';
import { C, RADII } from '@/design/tokens';

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const width = collapsed ? 64 : 240;
  return (
    <aside style={{
      width, background: C.primary, color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '20px 10px', gap: 4
    }}>
      <div style={{ padding: '0 10px 16px', fontWeight: 800, fontSize: collapsed ? 16 : 18, whiteSpace: 'nowrap' }}>
        {collapsed ? '태' : '태 TKD Trainer'}
      </div>
      {NAV.map((n) => (
        <NavLink key={n.id} to={n.path} end={n.path === '/dashboard'}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: RADII.sm,
            color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
            background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            fontWeight: isActive ? 700 : 500, textDecoration: 'none',
            overflow: 'hidden', whiteSpace: 'nowrap'
          })}
          title={n.label}
        >
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          {!collapsed && <span>{n.label}</span>}
        </NavLink>
      ))}
    </aside>
  );
}
