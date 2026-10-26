import { NavLink, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Activity,
  CircleAlert,
} from "lucide-react";
import { APP_NAV } from "../../app/navigation";
import { useApp } from "../../context/app-context";

function NavItem({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const isActive = item.match.some((path) =>
    item.end ? pathname === path : pathname === path || pathname.startsWith(`${path}/`)
  );

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`nav-link ${isActive ? "active" : ""} ${
        collapsed ? "lg:justify-center lg:px-0" : ""
      }`}
    >
      <Icon size={19} className="nav-icon shrink-0 transition-colors" />
      <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
    </NavLink>
  );
}

export function Sidebar({ collapsed, onToggleCollapsed, drawerOpen, onCloseDrawer }) {
  const { health } = useApp();
  const modelReady = Boolean(health?.model?.is_ready);
  const sidebarVar = collapsed ? "var(--spacing-sidebar-collapsed)" : "var(--spacing-sidebar)";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onCloseDrawer}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Main navigation"
        style={{ "--sidebar-w": sidebarVar }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col border-r border-line bg-abyss/85 backdrop-blur-xl transition-[transform,width] duration-300 ease-out lg:w-[var(--sidebar-w)] lg:max-w-none ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div
          className={`flex items-center gap-3 border-b border-line px-4 py-4 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-glow-cyan via-glow-blue to-glow-violet shadow-[0_8px_24px_-8px_rgba(34,211,238,0.7)]">
            <BrainCircuit size={22} className="text-void" strokeWidth={2.2} />
          </div>
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <div className="truncate text-[1.05rem] leading-tight font-extrabold tracking-tight text-mist">
              NeuroScan
            </div>
            <div className="text-[0.62rem] font-semibold tracking-[0.18em] text-glow-cyan uppercase">
              Alzheimer's DL Lab
            </div>
          </div>
          <button
            onClick={onCloseDrawer}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-1.5 text-dim transition hover:bg-white/10 hover:text-mist lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {APP_NAV.map((section) => (
            <div key={section.title}>
              <div
                className={`px-3 pb-2 text-[0.62rem] font-bold tracking-[0.18em] text-dim uppercase ${
                  collapsed ? "lg:text-center lg:px-0" : ""
                }`}
              >
                {collapsed ? <span className="lg:hidden">{section.title}</span> : section.title}
              </div>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onCloseDrawer}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer status + collapse control */}
        <div className="space-y-3 border-t border-line px-3 py-3">
          <div className={`space-y-1.5 px-2 text-[0.7rem] text-dim ${collapsed ? "lg:hidden" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <span>Architecture</span>
              <strong className="font-mono text-[0.66rem] text-glow-cyan">CNN + BiLSTM</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Model</span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  modelReady ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {modelReady ? <Activity size={11} /> : <CircleAlert size={11} />}
                {modelReady ? "Ready" : "Pending"}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[0.78rem] font-medium text-dim transition hover:bg-white/5 hover:text-mist lg:flex ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            <span className={collapsed ? "hidden" : ""}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
