import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { PageSkeleton } from "./components/ui/PageSkeleton";
import { RouteErrorBoundary } from "./components/ui/ErrorBoundary";

/* Route-level code splitting — each workspace screen is its own chunk. */
const OverviewPage = lazy(() => import("../src/pages/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const AnalyzePage = lazy(() => import("../src/pages/AnalyzePage").then((m) => ({ default: m.AnalyzePage })));
const ResultsPage = lazy(() => import("../src/pages/ResultsPage").then((m) => ({ default: m.ResultsPage })));
const GradCamPage = lazy(() => import("../src/pages/ExplainabilityPage").then((m) => ({ default: m.ExplainabilityPage })));
const HistoryPage = lazy(() => import("../src/pages/HistoryPage").then((m) => ({ default: m.HistoryPage })));
const InsightsPage = lazy(() => import("../src/pages/InsightsPage").then((m) => ({ default: m.InsightsPage })));
const SettingsPage = lazy(() => import("../src/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function DashboardFallback() {
  return <PageSkeleton />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RouteErrorBoundary>
        <Suspense fallback={<DashboardFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="analyze" element={<AnalyzePage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="gradcam" element={<GradCamPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Legacy paths from the first version of the app */}
            <Route path="/analyze" element={<Navigate to="/app/analyze" replace />} />
            <Route path="/results" element={<Navigate to="/app/results" replace />} />
            <Route path="/explainability" element={<Navigate to="/app/gradcam" replace />} />
            <Route path="/performance" element={<Navigate to="/app/insights" replace />} />
            <Route path="/history" element={<Navigate to="/app/history" replace />} />
            <Route path="/about" element={<Navigate to="/app/insights" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}
