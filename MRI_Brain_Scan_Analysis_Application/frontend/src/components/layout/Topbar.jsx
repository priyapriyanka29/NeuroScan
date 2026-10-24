import { MenuIcon, RefreshCwIcon } from "../icons/Icons";

export function Topbar({ currentPageTitle, health, onRefreshHealth, onToggleSidebar }) {
  const getBadge = () => {
    if (!health) {
      return (
        <span className="badge badge-offline">
          <span className="badge-dot" /> Backend Offline
        </span>
      );
    }
    if (health.model?.is_ready) {
      return (
        <span className="badge badge-online">
          <span className="badge-dot" /> Model Ready (CNN+BiLSTM)
        </span>
      );
    }
    return (
      <span className="badge badge-pending">
        <span className="badge-dot" /> Model Artifact Required
      </span>
    );
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="btn btn-outline btn-sm mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{ display: "none" }} // overridden in CSS for mobile
        >
          <MenuIcon size={18} />
        </button>
        <h1 className="page-title">{currentPageTitle}</h1>
      </div>

      <div className="topbar-right">
        {getBadge()}
        <button
          className="btn btn-outline btn-sm"
          onClick={onRefreshHealth}
          title="Refresh Backend & Model Status"
          aria-label="Refresh status"
        >
          <RefreshCwIcon size={14} />
          <span>Sync Status</span>
        </button>
      </div>
    </header>
  );
}
