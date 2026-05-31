import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AppRouter } from '@/router';
import { useData } from '@/state/dataStore';
import { useAuth } from '@/features/auth/authStore';
import { LoginPage } from '@/features/auth/LoginPage';
import { injectGlobalStyles } from '@/design/globalStyles';
import { C } from '@/design/tokens';

function SplashScreen({ status }: { status: string }) {
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

export default function App() {
  const [status, setStatus] = useState<string>('Start …');
  const [dataReady, setDataReady] = useState(false);
  const loadAll = useData((s) => s.loadAll);

  const initAuth = useAuth((s) => s.init);
  const authReady = useAuth((s) => s.ready);
  const session = useAuth((s) => s.session);

  useEffect(() => {
    injectGlobalStyles();
    initAuth();
  }, [initAuth]);

  // Daten erst nach erfolgreicher Anmeldung laden.
  useEffect(() => {
    if (!session) {
      setDataReady(false);
      return;
    }
    let cancelled = false;
    setStatus('Daten werden geladen …');
    (async () => {
      await loadAll();
      if (cancelled) return;
      setDataReady(true);
    })().catch((e) => {
      console.error(e);
      if (!cancelled) setStatus('Fehler beim Laden: ' + (e as Error).message);
    });
    return () => { cancelled = true; };
  }, [session, loadAll]);

  if (!authReady) return <SplashScreen status="Sitzung wird geprüft …" />;
  if (!session) return <LoginPage />;
  if (!dataReady) return <SplashScreen status={status} />;

  return (
    <BrowserRouter basename="/taekwondo-trainer-app">
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  );
}
