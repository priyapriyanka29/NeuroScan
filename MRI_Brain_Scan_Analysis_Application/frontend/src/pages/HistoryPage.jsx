import { HistoryIcon, TrashIcon, ArrowRightIcon, ActivityIcon } from "../components/icons/Icons";

export function HistoryPage({ history, onClearHistory, onSelectResult, onNavigateToAnalyze }) {
  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <HistoryIcon size={20} className="text-teal-600" />
              <span>Session Analysis Audit Log</span>
            </div>
            <div className="card-subtitle">
              Transient session record of analyzed scans (strictly local; no patient data transmitted or stored)
            </div>
          </div>

          {history.length > 0 && (
            <button className="btn btn-danger-outline btn-sm" onClick={onClearHistory}>
              <TrashIcon size={14} />
              <span>Purge History</span>
            </button>
          )}
        </div>

        <div className="card-body">
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-slate-100)", color: "var(--color-slate-400)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <HistoryIcon size={26} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
                No Scan History Recorded
              </h3>
              <p style={{ color: "var(--color-slate-500)", maxWidth: 460, margin: "8px auto 20px", fontSize: "0.85rem" }}>
                Scans analyzed during this session will be recorded here for clinical comparison.
              </p>
              <button className="btn btn-primary" onClick={onNavigateToAnalyze}>
                <span>Analyze Scan Now</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      background: "var(--color-slate-50)",
                      borderRadius: 8,
                      border: "1px solid var(--color-slate-200)",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {item.original_image_base64 && (
                        <img
                          src={item.original_image_base64}
                          alt="Thumbnail"
                          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, background: "#000" }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-navy-900)", fontSize: "0.92rem" }}>
                          {item.filename || `Scan #${history.length - idx}`}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                          {new Date(item.timestamp).toLocaleTimeString()} &bull; {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className={`badge-stage stage-${item.predicted_class}`} style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                        {item.predicted_class}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-slate-700)" }}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onSelectResult(item)}
                      >
                        <ActivityIcon size={14} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
