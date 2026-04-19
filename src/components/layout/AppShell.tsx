import { ReactNode } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Drawer } from './Drawer';
import { Header } from './Header';
import { ToastHost } from '@/components/ui/Toast';
import { ConfirmHost } from '@/components/ui/ConfirmDialog';
import { C } from '@/design/tokens';

export function AppShell({ children }: { children: ReactNode }) {
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text }}>
      {!mobile && <Sidebar collapsed={bp === 'tablet'} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: mobile ? '12px 12px 80px' : '16px 24px', overflow: 'auto' }}>
          {children}
        </main>
        {mobile && <BottomNav />}
        <Drawer />
      </div>
      <ToastHost />
      <ConfirmHost />
    </div>
  );
}
