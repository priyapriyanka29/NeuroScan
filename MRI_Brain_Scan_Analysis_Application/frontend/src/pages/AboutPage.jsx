import { BrainIcon, InfoIcon, LayersIcon, CheckCircleIcon } from "../components/icons/Icons";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";

export function AboutPage() {
  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <InfoIcon size={20} className="text-teal-600" />
              <span>About NeuroScan AI Research Laboratory</span>
            </div>
            <div className="card-subtitle">
              Advanced deep learning research platform for Alzheimer's stage classification and interpretability
            </div>
          </div>
        </div>

        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 8 }}>
              Research Mission
            </h3>
            <p style={{ color: "var(--color-slate-700)", lineHeight: 1.6, fontSize: "0.9rem" }}>
              NeuroScan is dedicated to closing the gap between high-dimensional medical neuroimaging and transparent,
              explainable deep learning systems. Alzheimer’s Disease is characterized by subtle morphological shifts—such
              as entorhinal cortex thinning, medial temporal lobe atrophy, and lateral ventriculomegaly—that often precede
              overt clinical symptoms. NeuroScan combines spatial CNNs with bidirectional sequence modeling (BiLSTM) and
              attention to detect and visualize these structural biomarkers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "var(--color-slate-50)", padding: 18, borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 8 }}>
                Cognitive Target Categories
              </div>
              <ul style={{ fontSize: "0.82rem", color: "var(--color-slate-700)", paddingLeft: 18, lineHeight: 1.6 }}>
                <li><strong>NonDemented:</strong> Normal aging controls with intact cortical thickness.</li>
                <li><strong>VeryMildDemented:</strong> Early prodromal stage; subtle entorhinal loss.</li>
                <li><strong>MildDemented:</strong> Marked hippocampal atrophy and lateral ventricle dilation.</li>
                <li><strong>ModerateDemented:</strong> Severe, generalized bilateral cerebral atrophy.</li>
              </ul>
            </div>

            <div style={{ background: "var(--color-slate-50)", padding: 18, borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 8 }}>
                Technology & Architecture Stack
              </div>
              <ul style={{ fontSize: "0.82rem", color: "var(--color-slate-700)", paddingLeft: 18, lineHeight: 1.6 }}>
                <li><strong>Neural Backbone:</strong> CNN + BiLSTM + Attention + Grad-CAM.</li>
                <li><strong>Inference Engine:</strong> FastAPI, Python 3.11, Uvicorn, Pillow, NumPy.</li>
                <li><strong>Client Application:</strong> React 19, Vite, Plus Jakarta Sans, Custom Design Tokens.</li>
                <li><strong>Explainability:</strong> Gradient-weighted Class Activation Mapping (Grad-CAM).</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 8 }}>
              Open Research Dataset Citations
            </h3>
            <p style={{ color: "var(--color-slate-700)", lineHeight: 1.6, fontSize: "0.88rem" }}>
              NeuroScan is benchmarked on the open-source Alzheimer's Multiclass Dataset (equal and augmented)
              derived from OASIS (Open Access Series of Imaging Studies) and ADNI (Alzheimer's Disease Neuroimaging Initiative).
            </p>
          </div>
        </div>
      </div>

      <ClinicalDisclaimer />
    </div>
  );
}
