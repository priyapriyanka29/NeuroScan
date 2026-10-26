import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Database,
  Download,
  Info,
  Monitor,
  RefreshCw,
  Server,
  Trash2,
  UserRoundX,
} from "lucide-react";
import { Alert } from "../components/ui/Alert";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Toggle } from "../components/ui/Toggle";
import { API_BASE_URL, API_CONFIGURED } from "../services/api";
import { useApp } from "../context/app-context";

function Row({ icon, label, value, tone = "text-mist" }) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="inline-flex min-w-0 items-center gap-2 text-[0.82rem] text-dim">
        <Icon size={14} className="shrink-0 text-glow-cyan" />
        <span className="truncate">{label}</span>
      </span>
      <span className={`mono min-w-0 truncate text-right text-[0.78rem] ${tone}`}>{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const {
    health,
    connection,
    refreshHealth,
    settings,
    setReducedMotion,
    history,
    clearHistory,
    exportHistory,
    addToast,
  } = useApp();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (testing) return;
    setTesting(true);
    await refreshHealth();
    setTesting(false);
  };

  const handleClear = () => {
    if (
      window.confirm(
        `Clear ${history.length} session record${history.length === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      clearHistory();
    }
  };

  const handleExport = () => {
    exportHistory();
    addToast({
      type: "success",
      title: "Session exported",
      message: `${history.length} record${history.length === 1 ? "" : "s"} written to JSON.`,
    });
  };

  const connectionTone =
    connection.state === "ok" ? "text-emerald-300" : connection.state === "down" ? "text-red-300" : "text-amber-300";

  return (
    <div className="flex flex-col gap-6">
      {connection.state === "down" && (
        <Alert
          tone="error"
          title="Backend unreachable"
          actions={
            <button className="btn btn-secondary btn-sm" onClick={handleTest} disabled={testing}>
              <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
              Retry
            </button>
          }
        >
          Requests to{" "}
          <code className="code-chip">{API_BASE_URL || "(no base URL)"}</code> are failing.
          {API_CONFIGURED ? (
            <>
              " "
              Start the API with <code className="code-chip">uvicorn main:app --port 8000</code>,
              then test again.
            </>
          ) : (
            <>
              " "
              Set <code className="code-chip">VITE_API_URL</code> at build time and rebuild this
              bundle.
            </>
          )}
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Connection */}
        <Card className="animate-fade-up">
          <CardHeader
            icon={<Server size={18} className="text-glow-cyan" />}
            title="API connection"
            subtitle="Live status of the FastAPI inference service"
            actions={
              <button className="btn btn-primary btn-sm" onClick={handleTest} disabled={testing}>
                <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
                {testing ? "Testing…" : "Test connection"}
              </button>
            }
          />
          <CardBody className="divide-y divide-white/5">
            <Row
              icon={connection.state === "down" ? CircleAlert : CheckCircle2}
              label="State"
              value={connection.state === "ok" ? "reachable" : connection.state === "down" ? "unreachable" : "checking"}
              tone={connectionTone}
            />
            <Row
              icon={Server}
              label="Base URL"
              value={API_BASE_URL || "not configured (VITE_API_URL missing)"}
              tone={API_CONFIGURED ? undefined : "text-amber-300"}
            />
            <Row
              icon={RefreshCw}
              label="Round-trip latency"
              value={connection.latencyMs != null ? `${connection.latencyMs} ms` : "—"}
            />
            <Row
              icon={Info}
              label="Last checked"
              value={connection.checkedAt ? new Date(connection.checkedAt).toLocaleTimeString() : "—"}
            />
            <Row
              icon={Monitor}
              label="Model"
              value={
                health?.model
                  ? health.model.is_ready
                    ? `${health.model.status_code} · v${health.version}`
                    : health.model.status_code
                  : "no health data"
              }
              tone={health?.model?.is_ready ? "text-emerald-300" : "text-amber-300"}
            />
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card className="animate-fade-up stagger-1">
          <CardHeader
            icon={<Monitor size={18} className="text-violet-300" />}
            title="Preferences"
            subtitle="Stored locally in this browser"
          />
          <CardBody className="space-y-6">
            <Toggle
              checked={settings.reducedMotion}
              onChange={setReducedMotion}
              label="Reduce motion"
              description="Disables entrance animations, floating effects and progress transitions. Your operating-system setting (prefers-reduced-motion) is always respected as well."
            />

            <div className="rounded-xl border border-line bg-white/[0.03] p-3.5 text-[0.78rem] leading-relaxed text-dim">
              NeuroScan ships a single dark theme, so there is no theme switcher here — a control
              that does nothing would be worse than none. Motion, connection and session data are
              the only preferences this build actually supports.
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.03] p-3.5">
              <UserRoundX size={16} className="mt-0.5 shrink-0 text-glow-cyan" />
              <p className="text-[0.78rem] leading-relaxed text-haze">
                <strong className="text-mist">No accounts, no authentication.</strong> This is a
                local research prototype — there is no sign-in, no cloud sync and no profile to
                configure, so none is offered here.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Session data */}
        <Card className="animate-fade-up stagger-2">
          <CardHeader
            icon={<Database size={18} className="text-glow-teal" />}
            title="Session data"
            subtitle="Analysis history held in memory only"
          />
          <CardBody className="space-y-4">
            <div className="rounded-xl border border-line bg-white/[0.03] px-4 py-3.5">
              <div className="text-2xl font-extrabold text-mist">
                {history.length}
              </div>
              <div className="text-[0.76rem] text-dim">
                record{history.length === 1 ? "" : "s"} in this tab — cleared automatically on
                reload
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                disabled={history.length === 0}
              >
                <Download size={14} />
                Export JSON
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleClear}
                disabled={history.length === 0}
              >
                <Trash2 size={14} />
                Clear history
              </button>
              <Link to="/app/history" className="btn btn-secondary btn-sm">
                Open history
                <ArrowRight size={14} />
              </Link>
            </div>

            <p className="text-[0.78rem] leading-relaxed text-dim">
              Uploaded scans are sent only to the local API for inference. Neither the backend nor
              this frontend persists image data, so nothing can leak between sessions.
            </p>
          </CardBody>
        </Card>

        {/* About this build */}
        <Card className="animate-fade-up stagger-3">
          <CardHeader
            icon={<Info size={18} className="text-amber-300" />}
            title="About this build"
            subtitle="Version and environment facts"
          />
          <CardBody className="space-y-1.5">
            <Row icon={Database} label="API version" value={health?.version ? `v${health.version}` : "—"} />
            <Row
              icon={Monitor}
              label="Frontend"
              value={`React ${import.meta.env.VITE_APP_VERSION ? "" : ""}19 · Vite · Tailwind v4`}
            />
            <Row
              icon={Server}
              label="Override variable"
              value="VITE_API_URL"
              tone="text-glow-cyan"
            />
            <p className="pt-2 text-[0.78rem] leading-relaxed text-dim">
              Set <code className="code-chip">VITE_API_URL</code> in{" "}
              <code className="code-chip">frontend/.env</code> to point the app at a different host —
              {API_CONFIGURED ? (
                <>
                  the current value is <span className="mono text-haze">{API_BASE_URL}</span>.
                </>
              ) : (
                <span className="text-amber-300">
                  {" "}it is currently unset, so every API call fails until you set it and rebuild.
                </span>
              )}{" "}
              Rebuild after changing it.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
