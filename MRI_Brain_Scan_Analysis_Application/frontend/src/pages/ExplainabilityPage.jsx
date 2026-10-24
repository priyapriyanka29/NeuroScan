import { EyeIcon, InfoIcon, AlertTriangleIcon, LayersIcon, ArrowRightIcon } from "../components/icons/Icons";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";

export function ExplainabilityPage({ analysisResult, onNavigateToAnalyze }) {
  return (
    <div className="page-container">
      {/* Intro Header */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <EyeIcon size={20} className="text-teal-600" />
              <span>Explainable AI in Neurological Imaging (Grad-CAM)</span>
            </div>
            <div className="card-subtitle">
              Mathematical gradient tracking to localize model attention across cerebral anatomical structures
            </div>
          </div>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--color-slate-700)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Gradient-weighted Class Activation Mapping (Grad-CAM) utilizes the gradients of target class scores
            flowing into the final convolutional layer of the spatial CNN backbone.
            By computing the channel-wise importance weights \( \alpha_k^c \), it produces a coarse 2D localization map
            highlighting the salient morphological regions that influenced the network’s dementia stage classification.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>
            <div style={{ background: "var(--color-slate-50)", padding: 16, borderRadius: 8, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 4 }}>1. Final Convolutional Layer</div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)" }}>
                Captures high-level spatial semantic features (e.g. ventricle dilation, temporal lobe sulcal widening) before sequence flattening.
              </p>
            </div>
            <div style={{ background: "var(--color-slate-50)", padding: 16, borderRadius: 8, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 4 }}>2. Gradient Pooling</div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)" }}>
                Global average pooling across feature dimensions isolates how heavily each spatial filter contributed to the target dementia class.
              </p>
            </div>
            <div style={{ background: "var(--color-slate-50)", padding: 16, borderRadius: 8, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 4 }}>3. Thermal Overlay (JET)</div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)" }}>
                Heatmap values are passed through a ReLU activation and overlaid onto the grayscale MRI to visualize regional attention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Analysis Scan Showcase */}
      {analysisResult?.gradcam?.available ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>Active Scan Grad-CAM Visualization</span>
              <span className={`badge-stage stage-${analysisResult.predicted_class}`} style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                {analysisResult.predicted_class}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="gradcam-container">
              <div className="viewer-pane">
                <div className="viewer-header">Original T1-Weighted MRI Scan</div>
                <div className="viewer-img-wrapper">
                  <img src={analysisResult.original_image_base64} alt="Original MRI" />
                </div>
              </div>
              <div className="viewer-pane">
                <div className="viewer-header">Grad-CAM Overlay ({analysisResult.gradcam.target_layer || "Last Conv2D"})</div>
                <div className="viewer-img-wrapper">
                  <img src={analysisResult.gradcam.overlay_base64} alt="Grad-CAM Overlay" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, background: "var(--color-slate-50)", padding: 16, borderRadius: 8, border: "1px solid var(--color-slate-200)" }}>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6 }}>
                How to Interpret This Heatmap:
              </h4>
              <ul style={{ fontSize: "0.82rem", color: "var(--color-slate-700)", paddingLeft: 20, lineHeight: 1.6 }}>
                <li><strong style={{ color: "#DC2626" }}>Warm Red / Yellow Regions:</strong> Indicate areas where localized pixel patterns strongly increased the logit score for <em>{analysisResult.predicted_class}</em>.</li>
                <li><strong style={{ color: "#2563EB" }}>Cool Blue / Violet Regions:</strong> Represent brain structures with negligible gradient contribution towards this diagnostic classification.</li>
                <li><strong>Hippocampal & Ventricular Focus:</strong> In Alzheimer’s imaging, networks typically concentrate on medial temporal lobe atrophy and lateral ventricular enlargement.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-teal-50)", color: "var(--color-teal-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <EyeIcon size={28} />
          </div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
            No Active Grad-CAM Heatmap to Display
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-slate-500)", maxWidth: 500, margin: "8px auto 20px" }}>
            Analyze an MRI scan with the deep learning model loaded to inspect real-time convolutional heatmaps.
          </p>
          <button className="btn btn-primary" onClick={onNavigateToAnalyze}>
            <span>Upload or Select MRI Scan</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      )}

      {/* Clinical Disclaimer */}
      <ClinicalDisclaimer />
    </div>
  );
}
