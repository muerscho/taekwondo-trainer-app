import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AppRouter } from '@/router';
import { bootstrapStorage } from '@/storage/bootstrap';
import { useData } from '@/state/dataStore';
import { injectGlobalStyles } from '@/design/globalStyles';
import { C } from '@/design/tokens';

export default function App() {
  const [status, setStatus] = useState<string>('Start …');
  const [ready, setReady] = useState(false);
  const loadAll = useData((s) => s.loadAll);

  useEffect(() => {
    injectGlobalStyles();
    let cancelled = false;
    (async () => {
      await bootstrapStorage({ onStatus: (m) => !cancelled && setStatus(m) });
      loadAll();
      setReady(true);
    })().catch((e) => {
      console.error(e);
      setStatus('Fehler beim Start: ' + (e as Error).message);
    });
    return () => { cancelled = true; };
  }, [loadAll]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>태</div>
          <h1 style={{ color: C.primary, margin: '8px 0' }}>TKD Trainer</h1>
          <p style={{ color: C.textMuted, fontSize: 13 }}>{status}</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  );
}
