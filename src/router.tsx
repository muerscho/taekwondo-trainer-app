import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { C } from '@/design/tokens';
// Vite code-splitting: each feature page lazy-loaded



const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
const Planung = lazy(() => import('@/features/planung/PlanungPage'));
const EinheitEditor = lazy(() => import('@/features/planung/EinheitEditorPage'));
const Athleten = lazy(() => import('@/features/athleten/AthletenListePage'));
const AthletProfil = lazy(() => import('@/features/athleten/AthletProfilPage'));
const Anwesenheit = lazy(() => import('@/features/anwesenheit/AnwesenheitPage'));
const AnwesenheitErfassung = lazy(() => import('@/features/anwesenheit/ErfassungsPage'));
const Pruefungen = lazy(() => import('@/features/pruefungen/TerminListePage'));
const TerminDetail = lazy(() => import('@/features/pruefungen/TerminDetailPage'));
const Bibliothek = lazy(() => import('@/features/bibliothek/BibliothekListePage'));
const EintragDetail = lazy(() => import('@/features/bibliothek/EintragDetailPage'));
const Auswertung = lazy(() => import('@/features/auswertung/AuswertungPage'));
const Einstellungen = lazy(() => import('@/features/einstellungen/EinstellungenPage'));

function Loading() {
  return <div style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>Lade …</div>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planung" element={<Planung />} />
        <Route path="/planung/einheit/:id" element={<EinheitEditor />} />
        <Route path="/athleten" element={<Athleten />} />
        <Route path="/athleten/:id" element={<AthletProfil />} />
        <Route path="/anwesenheit" element={<Anwesenheit />} />
        <Route path="/anwesenheit/einheit/:id" element={<AnwesenheitErfassung />} />
        <Route path="/pruefungen" element={<Pruefungen />} />
        <Route path="/pruefungen/:id" element={<TerminDetail />} />
        <Route path="/bibliothek" element={<Bibliothek />} />
        <Route path="/bibliothek/:id" element={<EintragDetail />} />
        <Route path="/auswertung" element={<Auswertung />} />
        <Route path="/einstellungen" element={<Einstellungen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
