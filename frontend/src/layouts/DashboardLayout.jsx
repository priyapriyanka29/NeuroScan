import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { ToastContainer } from "../components/common/Toast";
import { PageSkeleton } from "../components/ui/PageSkeleton";
import { useApp } from "../context/app-context";

const COLLAPSE_KEY = "neuroscan.sidebar.collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function DashboardLayout() {
  const { pathname } = useLocation();
  const { toasts, dismissToast } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  /* Close the mobile drawer and reset scroll whenever the route changes. */
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  const sidebarVar = collapsed ? "var(--spacing-sidebar-collapsed)" : "var(--spacing-sidebar)";

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
      />

      {/* Offset only on desktop, where the rail is docked. */}
      <div
        className="flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-out lg:ps-[var(--sidebar-w)]"
        style={{ "--sidebar-w": sidebarVar }}
      >
        <Topbar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
            <div key={pathname} className="animate-fade-up">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
