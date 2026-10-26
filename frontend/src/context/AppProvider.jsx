import { useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from "./app-context";
import { checkBackendHealth } from "../services/api";
import { downloadJson } from "../app/download";

const SETTINGS_KEY = "neuroscan.settings";

const DEFAULT_SETTINGS = { reducedMotion: false };

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let toastSeq = 0;

export function AppProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState(readSettings);
  const [connection, setConnection] = useState({ state: "checking", latencyMs: null, checkedAt: null });

  /* ---------------- toasts ---------------- */
  const addToast = useCallback(({ type = "info", title, message, duration = 5000 }) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------------- settings ---------------- */
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable — preference simply does not persist */
    }
    document.documentElement.classList.toggle("reduce-motion", Boolean(settings.reducedMotion));
  }, [settings]);

  const setReducedMotion = useCallback((enabled) => {
    setSettings((prev) => ({ ...prev, reducedMotion: Boolean(enabled) }));
  }, []);

  /* ---------------- connectivity ---------------- */
  const refreshHealth = useCallback(
    async ({ silent = false } = {}) => {
      const started = performance.now();
      const res = await checkBackendHealth();
      const latencyMs = Math.round(performance.now() - started);

      if (res.ok) {
        setHealth(res.data);
        setConnection({ state: "ok", latencyMs, checkedAt: Date.now() });
        if (!silent) {
          addToast({
            type: "success",
            title: "Connection Verified",
            message: `API responded in ${latencyMs} ms.`,
          });
        }
        return true;
      }

      setHealth(null);
      setConnection({ state: "down", latencyMs: null, checkedAt: Date.now() });
      if (!silent) {
        addToast({
          type: "error",
          title: "Backend Unreachable",
          message: "Cannot establish a connection with the NeuroScan API service.",
        });
      }
      return false;
    },
    [addToast]
  );

  /* Initial status probe stays silent — no toast on first paint. */
  useEffect(() => {
    refreshHealth({ silent: true });
  }, [refreshHealth]);

  /* ---------------- session analysis history ---------------- */
  const recordAnalysis = useCallback((result) => {
    setAnalysisResult(result);
    setHistory((prev) => [result, ...prev]);
  }, []);

  const selectFromHistory = useCallback((item) => {
    setAnalysisResult(item);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setAnalysisResult(null);
    addToast({
      type: "info",
      title: "Session History Cleared",
      message: "All locally held scan records were removed.",
    });
  }, [addToast]);

  /** Client-side export of the in-memory session log. Returns the blob URL used. */
  const exportHistory = useCallback(() => {
    const payload = history.map((item) => ({
      filename: item.filename ?? null,
      timestamp: item.timestamp ?? null,
      predicted_class: item.predicted_class,
      confidence: item.confidence,
      probabilities: item.probabilities ?? null,
      processing_time_ms: item.metadata?.processing_time_ms ?? null,
      gradcam_available: Boolean(item.gradcam?.available),
    }));

    return downloadJson(
      payload,
      `neuroscan-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`
    );
  }, [history]);

  const value = useMemo(
    () => ({
      health,
      refreshHealth,
      connection,
      settings,
      setReducedMotion,
      analysisResult,
      recordAnalysis,
      selectFromHistory,
      history,
      clearHistory,
      exportHistory,
      toasts,
      addToast,
      dismissToast,
    }),
    [
      health,
      refreshHealth,
      connection,
      settings,
      setReducedMotion,
      analysisResult,
      recordAnalysis,
      selectFromHistory,
      history,
      clearHistory,
      exportHistory,
      toasts,
      addToast,
      dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
