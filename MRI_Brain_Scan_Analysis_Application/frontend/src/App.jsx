import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ToastContainer } from "./components/common/Toast";
import { OverviewPage } from "./pages/OverviewPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { ResultsPage } from "./pages/ResultsPage";
import { ExplainabilityPage } from "./pages/ExplainabilityPage";
import { ModelPerformancePage } from "./pages/ModelPerformancePage";
import { HistoryPage } from "./pages/HistoryPage";
import { AboutPage } from "./pages/AboutPage";
import { checkBackendHealth } from "./services/api";

const PAGE_TITLES = {
  overview: "Clinical Overview & Architecture",
  analyze: "Analyze Brain MRI Scan",
  results: "Diagnostic Classification Results",
  explainability: "Explainability & Grad-CAM Heatmaps",
  performance: "Model Performance & Evaluation",
  history: "Session Analysis History",
  about: "About NeuroScan Research Laboratory",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [health, setHealth] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addToast = useCallback(({ type = "info", title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshHealth = useCallback(async () => {
    const res = await checkBackendHealth();
    if (res.ok) {
      setHealth(res.data);
    } else {
      setHealth(null);
      addToast({
        type: "error",
        title: "Backend Unreachable",
        message: "Cannot establish connection with the NeuroScan API service."
      });
    }
  }, [addToast]);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setHistory((prev) => [result, ...prev]);
    setCurrentPage("results");
  };

  const handleSelectHistoryResult = (item) => {
    setAnalysisResult(item);
    setCurrentPage("results");
  };

  const handleClearHistory = () => {
    setHistory([]);
    addToast({
      type: "info",
      title: "History Cleared",
      message: "Session analysis history has been purged."
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage onNavigateToAnalyze={() => setCurrentPage("analyze")} />;
      case "analyze":
        return (
          <AnalyzePage
            onAnalysisComplete={handleAnalysisComplete}
            addToast={addToast}
            health={health}
          />
        );
      case "results":
        return (
          <ResultsPage
            analysisResult={analysisResult}
            onNavigateToAnalyze={() => setCurrentPage("analyze")}
          />
        );
      case "explainability":
        return (
          <ExplainabilityPage
            analysisResult={analysisResult}
            onNavigateToAnalyze={() => setCurrentPage("analyze")}
          />
        );
      case "performance":
        return <ModelPerformancePage />;
      case "history":
        return (
          <HistoryPage
            history={history}
            onClearHistory={handleClearHistory}
            onSelectResult={handleSelectHistoryResult}
            onNavigateToAnalyze={() => setCurrentPage("analyze")}
          />
        );
      case "about":
        return <AboutPage />;
      default:
        return <OverviewPage onNavigateToAnalyze={() => setCurrentPage("analyze")} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        modelReady={health?.model?.is_ready || false}
      />

      <main className="app-main">
        <Topbar
          currentPageTitle={PAGE_TITLES[currentPage] || "NeuroScan"}
          health={health}
          onRefreshHealth={refreshHealth}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {renderCurrentPage()}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
