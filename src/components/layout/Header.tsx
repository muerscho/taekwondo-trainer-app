import { useLocation, Link } from 'react-router-dom';
import { NAV } from './navConfig';
import { C } from '@/design/tokens';
import { formatTodayHeader } from '@/domain/derivations';

export function Header() {
  const loc = useLocation();
  const active = NAV.find((n) => loc.pathname === n.path || loc.pathname.startsWith(n.path + '/')) ?? NAV[0];
  return (
    <header style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 22 }}>{active.icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{active.label}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{formatTodayHeader()}</div>
        </div>
      </div>
      <Link to="/einstellungen" aria-label="Einstellungen" style={{ color: C.textMuted, textDecoration: 'none', fontSize: 20 }}>⚙️</Link>
    </header>
  );
}
