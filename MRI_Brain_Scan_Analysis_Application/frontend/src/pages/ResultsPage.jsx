import { useState } from "react";
import {
  ActivityIcon,
  EyeIcon,
  ArrowRightIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  InfoIcon,
} from "../components/icons/Icons";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";

export function ResultsPage({ analysisResult, onNavigateToAnalyze }) {
  const [viewMode, setViewMode] = useState("overlay"); // "overlay", "side-by-side", "heatmap"

  if (!analysisResult) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-slate-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "var(--color-slate-400)" }}>
            <ActivityIcon size={32} />
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
            No Analysis Results Yet
          </h2>
          <p style={{ color: "var(--color-slate-500)", maxWidth: 440, margin: "8px auto 24px", fontSize: "0.9rem" }}>
            Upload an MRI scan or choose from the clinical reference samples on the Analyze page to view classification scores and Grad-CAM explainability.
          </p>
          <div>
            <button className="btn btn-primary btn-lg" onClick={onNavigateToAnalyze}>
              <UploadCloudIcon size={18} />
              <span>Go to Analyze MRI</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    predicted_class,
    confidence,
    probabilities = {},
    original_image_base64,
    gradcam = {},
    metadata = {},
    filename,
    fileSize,
  } = analysisResult;

  const stageDescriptions = {
    NonDemented: "Cognitively Normal — preserved bilateral cortical thickness and ventricular boundaries.",
    VeryMildDemented: "Very Mild Impairment — early prodromal atrophy concentrated in entorhinal cortex.",
    MildDemented: "Mild Impairment — moderate hippocampal volume loss and temporal horn enlargement.",
    ModerateDemented: "Moderate Impairment — severe ventriculomegaly and generalized cerebral atrophy.",
  };

  const getScoreColor = (cls) => {
    switch (cls) {
      case "NonDemented":
        return "var(--stage-nondemented)";
      case "VeryMildDemented":
        return "var(--stage-verymild)";
      case "MildDemented":
        return "var(--stage-mild)";
      case "ModerateDemented":
        return "var(--stage-moderate)";
      default:
        return "var(--color-teal-600)";
    }
  };

  return (
    <div className="page-container">
      {/* Top Banner with Diagnosis Badge */}
      <div className="card" style={{ borderLeft: `6px solid ${getScoreColor(predicted_class)}` }}>
        <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-slate-500)", marginBottom: 4 }}>
              Diagnostic Model Classification
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className={`badge-stage stage-${predicted_class}`} style={{ fontSize: "1.2rem", padding: "8px 18px" }}>
                {predicted_class}
              </span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
                {(confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-slate-600)", marginTop: 8 }}>
              {stageDescriptions[predicted_class] || ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={onNavigateToAnalyze}>
              <UploadCloudIcon size={16} />
              <span>Analyze Another Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visuals & Probabilities */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* Left Column: Visualizers */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <EyeIcon size={20} className="text-teal-600" />
                <span>MRI Scan & Explainability Visualization</span>
              </div>
              <div className="card-subtitle">
                Source: <strong>{filename || "Uploaded Scan"}</strong> {fileSize && `(${fileSize})`}
              </div>
            </div>

            {gradcam.available && (
              <div style={{ display: "flex", background: "var(--color-slate-100)", borderRadius: 6, padding: 2 }}>
                <button
                  className={`btn btn-sm ${viewMode === "overlay" ? "btn-secondary" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setViewMode("overlay")}
                >
                  Overlay
                </button>
                <button
                  className={`btn btn-sm ${viewMode === "side-by-side" ? "btn-secondary" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setViewMode("side-by-side")}
                >
                  Side-by-Side
                </button>
                <button
                  className={`btn btn-sm ${viewMode === "heatmap" ? "btn-secondary" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => setViewMode("heatmap")}
                >
                  Heatmap
                </button>
              </div>
            )}
          </div>

          <div className="card-body">
            {gradcam.available ? (
              viewMode === "side-by-side" ? (
                <div className="gradcam-container">
                  <div className="viewer-pane">
                    <div className="viewer-header">Original MRI Scan</div>
                    <div className="viewer-img-wrapper">
                      <img src={original_image_base64} alt="Original MRI" />
                    </div>
                  </div>
                  <div className="viewer-pane">
                    <div className="viewer-header">Grad-CAM Activation Overlay</div>
                    <div className="viewer-img-wrapper">
                      <img src={gradcam.overlay_base64} alt="Grad-CAM Overlay" />
                    </div>
                  </div>
                </div>
              ) : viewMode === "heatmap" ? (
                <div className="viewer-img-wrapper" style={{ maxHeight: 380 }}>
                  <img src={gradcam.heatmap_base64} alt="Grad-CAM Raw Heatmap" />
                </div>
              ) : (
                <div className="viewer-img-wrapper" style={{ maxHeight: 380 }}>
                  <img src={gradcam.overlay_base64} alt="Grad-CAM Overlay" />
                </div>
              )
            ) : (
              <div>
                <div className="viewer-img-wrapper" style={{ maxHeight: 360, margin: "0 auto" }}>
                  <img src={original_image_base64} alt="Original MRI Scan" />
                </div>
                <div style={{ marginTop: 14, background: "var(--color-slate-50)", border: "1px solid var(--color-slate-200)", borderRadius: 8, padding: 12, fontSize: "0.82rem", color: "var(--color-slate-600)", display: "flex", alignItems: "center", gap: 10 }}>
                  <InfoIcon size={18} style={{ color: "var(--color-teal-600)", flexShrink: 0 }} />
                  <div>
                    <strong>Explainability Notice:</strong>{" "}
                    {gradcam.reason || "Grad-CAM is available when a convolutional neural network backbone with active feature maps is loaded."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Score Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ActivityIcon size={20} className="text-teal-600" />
                <span>Four-Class Score Distribution</span>
              </div>
              <div className="card-subtitle">
                Calibrated multi-class probability output from the neural classification layer
              </div>
            </div>
          </div>

          <div className="card-body">
            {Object.keys(probabilities).length > 0 ? (
              <div>
                {Object.entries(probabilities).map(([cls, prob]) => {
                  const pct = (prob * 100).toFixed(1);
                  const isTop = cls === predicted_class;
                  return (
                    <div key={cls} className="score-row">
                      <div className="score-row-header">
                        <span className="score-label" style={{ fontWeight: isTop ? 700 : 500, color: isTop ? "var(--color-navy-900)" : "var(--color-slate-700)" }}>
                          {cls} {isTop && "(Predicted Stage)"}
                        </span>
                        <span className="score-value">{pct}%</span>
                      </div>
                      <div className="score-track">
                        <div
                          className="score-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: getScoreColor(cls),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "var(--color-slate-500)", fontSize: "0.88rem", padding: "20px 0" }}>
                Score breakdown is available when multi-class logits are returned.
              </div>
            )}

            {/* Inference Metadata */}
            <div style={{ marginTop: 24, borderTop: "1px solid var(--color-slate-100)", paddingTop: 18 }}>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-slate-500)", marginBottom: 12 }}>
                Technical Execution Telemetry
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.82rem" }}>
                <div style={{ background: "var(--color-slate-50)", padding: 8, borderRadius: 6 }}>
                  <span style={{ color: "var(--color-slate-500)" }}>Processing Latency:</span>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-navy-900)" }}>
                    {metadata.processing_time_ms ? `${metadata.processing_time_ms} ms` : "N/A"}
                  </div>
                </div>
                <div style={{ background: "var(--color-slate-50)", padding: 8, borderRadius: 6 }}>
                  <span style={{ color: "var(--color-slate-500)" }}>Input Tensor Shape:</span>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-navy-900)" }}>
                    {metadata.input_shape ? metadata.input_shape.join(" × ") : "176 × 208 × 1"}
                  </div>
                </div>
                <div style={{ background: "var(--color-slate-50)", padding: 8, borderRadius: 6 }}>
                  <span style={{ color: "var(--color-slate-500)" }}>Model Architecture:</span>
                  <div style={{ fontWeight: 700, color: "var(--color-teal-600)" }}>
                    {metadata.architecture || "CNN + BiLSTM + Attention"}
                  </div>
                </div>
                <div style={{ background: "var(--color-slate-50)", padding: 8, borderRadius: 6 }}>
                  <span style={{ color: "var(--color-slate-500)" }}>Model Release:</span>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-navy-900)" }}>
                    v{metadata.model_version || "2.0.0"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer />
    </div>
  );
}
