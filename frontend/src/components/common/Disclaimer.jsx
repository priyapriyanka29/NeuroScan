import { Alert } from "../ui/Alert";

export function ClinicalDisclaimer({ compact = false }) {
  return (
    <Alert tone="warning" title="Healthcare AI research notice">
      <span className={compact ? "text-[0.78rem]" : ""}>
        NeuroScan is an investigational deep learning research tool intended solely for academic
        analysis and methodological exploration. Its predictions, class probabilities and Grad-CAM
        activation heatmaps do <em>not</em> constitute a clinical diagnosis, medical opinion or
        treatment guidance. Grad-CAM visualises convolutional activations and does not prove
        pathology. All neuroimaging assessments require evaluation by a board-certified
        neuroradiologist.
      </span>
    </Alert>
  );
}
