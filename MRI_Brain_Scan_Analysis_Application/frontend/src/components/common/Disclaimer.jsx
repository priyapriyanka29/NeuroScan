import { AlertTriangleIcon } from "../icons/Icons";

export function ClinicalDisclaimer({ compact = false }) {
  return (
    <div className="disclaimer-banner" role="note" aria-label="Clinical AI Disclaimer">
      <AlertTriangleIcon size={compact ? 18 : 22} style={{ flexShrink: 0, marginTop: 1, color: "#D97706" }} />
      <div>
        <strong>Healthcare AI Research Notice:</strong>{" "}
        NeuroScan is an investigational deep learning research tool intended solely for academic analysis and methodological exploration.
        Its predictions, class probabilities, and Grad-CAM activation heatmaps do <em>not</em> constitute a clinical diagnosis, medical opinion, or treatment guidance.
        Grad-CAM visualizes convolutional activations and does not prove pathology. All neuroimaging assessments require evaluation by a board-certified neuroradiologist.
      </div>
    </div>
  );
}
