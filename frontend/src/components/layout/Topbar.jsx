import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeftOpen, RefreshCw, CircleAlert, Activity } from "lucide-react";
import { PAGE_META } from "../../app/navigation";
import { useApp } from "../../context/app-context";

function StatusPill() {
  const { health, connection, refreshHealth } = useApp();
  const [testing, setTesting] = useState(false);

  let className = "badge";
  let Icon = CircleAlert;
  let label = "Checking…";

  if (connection.state === "down" || !health) {
    className = "badge badge-offline";
    label = "Backend Offline";
  } else if (health.model?.is_ready) {
    className = "badge badge-online";
    Icon = Activity;
    label = "Model Ready";
  } else {
    className = "badge badge-pending";
    label = "Model Pending";
  }

  const handleTest = async () => {
    if (testing) return;
    setTesting(true);
    await refreshHealth();
    setTesting(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      <span className={className} title={`API: ${connection.state}`}>
        <span className="badge-dot" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(" ")[0]}</span>
      </span>

      <button
        onClick={handleTest}
        disabled={testing}
        title="Test API connection"
        aria-label="Test API connection"
        className="btn btn-secondary btn-sm"
      >
        <RefreshCw size={13} className={testing ? "animate-spin" : ""} />
        <span className="hidden md:inline">
          {testing ? "Testing…" : connection.latencyMs != null ? `${connection.latencyMs} ms` : "Test"}
        </span>
      </button>
    </div>
  );
}

export function Topbar({ collapsed, onToggleCollapsed, onOpenDrawer }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { title: "NeuroScan", subtitle: "" };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-void/70 backdrop-blur-xl">
      <div className="flex h-[var(--spacing-topbar)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile drawer trigger */}
        <button
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="btn btn-secondary btn-sm lg:hidden"
        >
          <Menu size={17} />
        </button>

        {/* Desktop collapse trigger */}
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="btn btn-secondary btn-sm hidden lg:inline-flex"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="page-title-eyebrow hidden sm:block">NeuroScan</div>
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="truncate text-[1.05rem] font-bold text-mist sm:text-[1.12rem]">
              {meta.title}
            </h1>
            <p className="hidden truncate text-[0.78rem] text-dim md:block">{meta.subtitle}</p>
          </div>
        </div>

        <StatusPill />
      </div>
    </header>
  );
}
