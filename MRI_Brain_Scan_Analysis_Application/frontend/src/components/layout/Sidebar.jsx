import {
  BrainIcon,
  UploadCloudIcon,
  ActivityIcon,
  EyeIcon,
  BarChartIcon,
  HistoryIcon,
  InfoIcon,
} from "../icons/Icons";

export function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen, modelReady }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: BrainIcon },
    { id: "analyze", label: "Analyze MRI", icon: UploadCloudIcon },
    { id: "results", label: "Prediction Results", icon: ActivityIcon },
    { id: "explainability", label: "Explainability / Grad-CAM", icon: EyeIcon },
    { id: "performance", label: "Model Performance", icon: BarChartIcon },
    { id: "history", label: "Analysis History", icon: HistoryIcon },
    { id: "about", label: "About NeuroScan", icon: InfoIcon },
  ];

  const handleSelect = (pageId) => {
    setCurrentPage(pageId);
    if (window.innerWidth < 900) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BrainIcon size={22} className="text-white" />
        </div>
        <div>
          <div className="brand-title">NeuroScan</div>
          <div className="brand-subtitle">Alzheimer's DL Lab</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Diagnostic System</div>
        {navItems.slice(0, 4).map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: 8 }}>Evaluation & History</div>
        {navItems.slice(4).map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Architecture:</span>
          <strong style={{ color: "#2DD4BF", fontSize: "0.7rem" }}>CNN + BiLSTM</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Status:</span>
          <span style={{ color: modelReady ? "#34D399" : "#FBBF24", fontWeight: 600 }}>
            {modelReady ? "Model Active" : "Artifact Pending"}
          </span>
        </div>
      </div>
    </aside>
  );
}
