import { useState, useEffect } from "react";
import { BarChartIcon, InfoIcon, AlertTriangleIcon, RefreshCwIcon, CheckCircleIcon } from "../components/icons/Icons";
import { fetchModelEvaluation } from "../services/api";

export function ModelPerformancePage() {
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchModelEvaluation();
    if (res.ok) {
      setEvaluationData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChartIcon size={20} className="text-teal-600" />
              <span>Model Evaluation & Benchmark Diagnostics</span>
            </div>
            <div className="card-subtitle">
              Verified clinical test set evaluation metrics for NeuroScan deep learning architecture
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCwIcon size={14} />
            <span>Reload Metrics</span>
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="spinner spinner-dark" style={{ margin: "0 auto 12px" }} />
              <div style={{ color: "var(--color-slate-500)", fontSize: "0.85rem" }}>Querying evaluation repository...</div>
            </div>
          ) : evaluationData?.evaluated && evaluationData?.metrics ? (
            /* Render real metrics */
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "var(--color-slate-50)", padding: 18, borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)", textTransform: "uppercase", fontWeight: 700 }}>Test Accuracy</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-teal-600)", marginTop: 4 }}>
                    {(evaluationData.metrics.accuracy * 100).toFixed(2)}%
                  </div>
                </div>
                <div style={{ background: "var(--color-slate-50)", padding: 18, borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)", textTransform: "uppercase", fontWeight: 700 }}>Macro F1-Score</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-navy-900)", marginTop: 4 }}>
                    {(evaluationData.metrics.macro_f1 * 100).toFixed(2)}%
                  </div>
                </div>
                <div style={{ background: "var(--color-slate-50)", padding: 18, borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)", textTransform: "uppercase", fontWeight: 700 }}>Test Samples</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-slate-700)", marginTop: 4 }}>
                    {evaluationData.metrics.total_samples || "N/A"}
                  </div>
                </div>
              </div>

              {/* Classification Report Table */}
              {evaluationData.metrics.classification_report && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12 }}>Per-Class Metrics</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "var(--color-slate-50)", borderBottom: "2px solid var(--color-slate-200)", textAlign: "left" }}>
                        <th style={{ padding: "10px 14px" }}>Class</th>
                        <th style={{ padding: "10px 14px" }}>Precision</th>
                        <th style={{ padding: "10px 14px" }}>Recall</th>
                        <th style={{ padding: "10px 14px" }}>F1-Score</th>
                        <th style={{ padding: "10px 14px" }}>Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(evaluationData.metrics.classification_report).map(([cls, row]) => (
                        <tr key={cls} style={{ borderBottom: "1px solid var(--color-slate-100)" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>{cls}</td>
                          <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>{(row.precision * 100).toFixed(1)}%</td>
                          <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>{(row.recall * 100).toFixed(1)}%</td>
                          <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>{(row.f1_score * 100).toFixed(1)}%</td>
                          <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>{row.support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Explicit "Not evaluated" State */
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertTriangleIcon size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
                Status: Not Evaluated
              </h3>
              <p style={{ color: "var(--color-slate-500)", maxWidth: 520, margin: "10px auto 20px", fontSize: "0.88rem", lineHeight: 1.5 }}>
                No verified evaluation benchmark file was detected. In accordance with NeuroScan clinical integrity guidelines,
                hypothetical or synthetic performance figures are strictly prohibited.
              </p>

              <div style={{ background: "var(--color-slate-50)", border: "1px solid var(--color-slate-200)", borderRadius: 10, padding: 20, textAlign: "left", maxWidth: 680, margin: "0 auto" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <InfoIcon size={16} className="text-teal-600" />
                  <span>How to Generate Evaluation Artifacts:</span>
                </h4>
                <ol style={{ fontSize: "0.82rem", color: "var(--color-slate-700)", paddingLeft: 20, lineHeight: 1.6 }}>
                  <li>Train or supply your deep learning model weights to <code>app/models/neuroscan_cnn_bilstm_attention.keras</code>.</li>
                  <li>Execute evaluation on the held-out test split of the Alzheimer's Multiclass Dataset.</li>
                  <li>Export the resulting confusion matrix and classification metrics as JSON to:
                    <br />
                    <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>
                      app/models/evaluation_metrics.json
                    </code>
                  </li>
                  <li>Reload this page to inspect verified test metrics.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
