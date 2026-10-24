import { BrainIcon, ArrowRightIcon, EyeIcon, ActivityIcon, LayersIcon } from "../components/icons/Icons";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";

export function OverviewPage({ onNavigateToAnalyze }) {
  const stages = [
    {
      id: "NonDemented",
      name: "Non-Demented",
      badgeClass: "stage-NonDemented",
      summary: "Cognitively unimpaired brain morphology with intact cortical thickness and bilateral hippocampal integrity.",
      biomarkers: "Preserved ventricular boundaries, symmetrical temporal structures, standard gray-white matter junction."
    },
    {
      id: "VeryMildDemented",
      name: "Very Mild Demented",
      badgeClass: "stage-VeryMildDemented",
      summary: "Early prodromal stage (often correlating with Mild Cognitive Impairment) with subtle localized atrophy.",
      biomarkers: "Initial micro-atrophy in entorhinal cortex, subtle widening of temporal horn sulci."
    },
    {
      id: "MildDemented",
      name: "Mild Demented",
      badgeClass: "stage-MildDemented",
      summary: "Clinically noticeable memory decline with progressive neurodegeneration across parietal and temporal lobes.",
      biomarkers: "Distinct bilateral hippocampal volume loss, moderate lateral ventricular enlargement."
    },
    {
      id: "ModerateDemented",
      name: "Moderate Demented",
      badgeClass: "stage-ModerateDemented",
      summary: "Advanced stages with extensive neurodegenerative loss, cortical thinning, and pronounced ventriculomegaly.",
      biomarkers: "Substantial global atrophy, pronounced sulcal widening, severe ventricular expansion."
    }
  ];

  return (
    <div className="page-container">
      {/* Hero Card */}
      <div className="card" style={{ background: "linear-gradient(135deg, #0B192C 0%, #152A4A 100%)", color: "#FFFFFF" }}>
        <div className="card-body" style={{ padding: "36px 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(13, 148, 136, 0.25)", border: "1px solid rgba(45, 212, 191, 0.4)", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 600, color: "#2DD4BF", marginBottom: 16 }}>
            <BrainIcon size={14} /> NeuroScan Deep Learning Framework
          </div>
          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginBottom: 12 }}>
            Alzheimer’s Disease Stage Classification & Explainability
          </h2>
          <p style={{ maxWidth: 820, color: "#CBD5E1", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: 24 }}>
            NeuroScan leverages deep convolutional spatial encoding, bidirectional sequence modeling (BiLSTM),
            and multi-head attention to classify multi-slice brain MRI into four severity stages.
            Visual explanations are produced via layer-targeted Gradient-weighted Class Activation Mapping (Grad-CAM).
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={onNavigateToAnalyze}
            >
              <span>Launch MRI Analysis</span>
              <ArrowRightIcon size={18} />
            </button>
            <a
              href="#architecture-section"
              className="btn btn-outline btn-lg"
              style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)" }}
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <ClinicalDisclaimer />

      {/* 4 Stages Breakdown */}
      <div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6 }}>
          Diagnostic Target Categories
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--color-slate-500)", marginBottom: 18 }}>
          NeuroScan classifies coronal and axial T1-weighted MRI scans into four standard clinical stages:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {stages.map((stg) => (
            <div key={stg.id} className="card">
              <div className="card-header" style={{ padding: "16px 20px" }}>
                <span className={`badge-stage ${stg.badgeClass}`}>
                  {stg.name}
                </span>
              </div>
              <div className="card-body" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: "0.85rem", color: "var(--color-slate-700)", lineHeight: 1.5 }}>
                  {stg.summary}
                </p>
                <div style={{ background: "var(--color-slate-50)", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-slate-200)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase" }}>Key MRI Biomarkers:</span>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-slate-600)", marginTop: 2 }}>{stg.biomarkers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Learning Architecture Details */}
      <div id="architecture-section" className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <LayersIcon size={20} className="text-teal-600" />
              <span>Multi-Stage Deep Learning Pipeline</span>
            </div>
            <div className="card-subtitle">
              Intended Deep Learning Architecture: CNN + BiLSTM + Attention + Grad-CAM
            </div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            <div style={{ padding: 18, background: "var(--color-slate-50)", borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#0B192C", color: "#FFF", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem" }}>1</span>
                <span>Spatial CNN Backbone</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)", lineHeight: 1.5 }}>
                Deep 2D Convolutional neural blocks extract hierarchical visual patterns from MRI slices, isolating tissue density gradients and boundary transitions.
              </p>
            </div>

            <div style={{ padding: 18, background: "var(--color-slate-50)", borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#0B192C", color: "#FFF", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem" }}>2</span>
                <span>Bidirectional LSTM</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)", lineHeight: 1.5 }}>
                BiLSTM captures sequential spatial dependencies across slice depths and spatial coordinates, preserving forward and reverse anatomical context.
              </p>
            </div>

            <div style={{ padding: 18, background: "var(--color-slate-50)", borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#0B192C", color: "#FFF", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem" }}>3</span>
                <span>Attention Mechanism</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)", lineHeight: 1.5 }}>
                Self-attention computes dynamic weights, dynamically emphasizing regions with morphological atrophy while suppressing irrelevant non-brain artifacts.
              </p>
            </div>

            <div style={{ padding: 18, background: "var(--color-slate-50)", borderRadius: 10, border: "1px solid var(--color-slate-200)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-navy-900)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#0B192C", color: "#FFF", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem" }}>4</span>
                <span>Grad-CAM Explainability</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--color-slate-600)", lineHeight: 1.5 }}>
                Computes gradients of target output logits with respect to final convolutional feature maps, producing thermal overlays for clinician interpretability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
