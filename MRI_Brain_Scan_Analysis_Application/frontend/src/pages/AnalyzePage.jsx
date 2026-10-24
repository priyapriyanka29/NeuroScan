import { useState, useRef } from "react";
import {
  UploadCloudIcon,
  TrashIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
} from "../components/icons/Icons";
import { SampleScansTray } from "../components/mri/SampleScans";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { analyzeMriScan } from "../services/api";

export function AnalyzePage({ onAnalysisComplete, addToast, health }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [clientError, setClientError] = useState(null);

  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setClientError(null);
    setModelError(null);

    if (!selectedFile) return;

    // Check file extension / MIME
    const validExtensions = [".jpg", ".jpeg", ".png"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setClientError(`Unsupported file format '${ext}'. Please upload an MRI scan in JPG, JPEG, or PNG format.`);
      addToast({
        type: "error",
        title: "Invalid File Type",
        message: "Accepted formats are JPG, JPEG, and PNG."
      });
      return;
    }

    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setClientError("File size exceeds 10MB limit. Please upload a compressed or standard resolution scan.");
      addToast({
        type: "error",
        title: "File Too Large",
        message: "Maximum upload size is 10 MB."
      });
      return;
    }

    setFile(selectedFile);
    setFileSizeStr((selectedFile.size / 1024).toFixed(1) + " KB");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileSizeStr("");
    setClientError(null);
    setModelError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectSample = (sampleFile) => {
    validateAndSetFile(sampleFile);
    addToast({
      type: "info",
      title: "Sample Scan Loaded",
      message: `Loaded dataset reference scan: ${sampleFile.name}`
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      setClientError("Please select or drop an MRI scan image before requesting analysis.");
      return;
    }

    setIsAnalyzing(true);
    setModelError(null);
    setClientError(null);

    const response = await analyzeMriScan(file);

    setIsAnalyzing(false);

    if (response.ok) {
      addToast({
        type: "success",
        title: "Analysis Complete",
        message: `Successfully classified scan as ${response.data.predicted_class}.`
      });
      onAnalysisComplete({
        ...response.data,
        filename: file.name,
        timestamp: new Date().toISOString(),
        fileSize: fileSizeStr,
      });
    } else {
      if (response.status === 503) {
        setModelError(response.error);
        addToast({
          type: "warning",
          title: "Model Artifact Required",
          message: "The backend is ready, but CNN+BiLSTM model weights must be supplied."
        });
      } else {
        const errorMsg = response.error?.message || response.error?.detail || "Scan analysis failed.";
        setClientError(errorMsg);
        addToast({
          type: "error",
          title: "Analysis Failed",
          message: errorMsg
        });
      }
    }
  };

  return (
    <div className="page-container">
      {/* Model Pending Banner if backend reports no model */}
      {health && !health.model?.is_ready && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <InfoIcon size={22} style={{ color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: "#1E40AF", fontSize: "0.9rem" }}>Model Integration Status: Weights Pending</strong>
            <p style={{ fontSize: "0.82rem", color: "#1E3A8A", marginTop: 4, lineHeight: 1.5 }}>
              The NeuroScan API is operational and enforces strict model validation.
              Per protocol, legacy scikit-learn classifiers and heuristic fallbacks have been removed.
              Place your trained <code>neuroscan_cnn_bilstm_attention.keras</code> model file in <code>app/models/</code> to enable full inference and Grad-CAM generation.
            </p>
          </div>
        </div>
      )}

      {/* Main Upload Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <UploadCloudIcon size={20} className="text-teal-600" />
              <span>MRI Scan Ingestion & Quality Validation</span>
            </div>
            <div className="card-subtitle">
              Upload T1-weighted axial/coronal brain MRI scan in JPG, JPEG, or PNG format (Max: 10MB)
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Dropzone or Preview */}
          {!previewUrl ? (
            <div
              className={`dropzone ${isDragging ? "dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload MRI image dropzone"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <div className="dropzone-icon-circle">
                <UploadCloudIcon size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-navy-900)" }}>
                Drag and drop your MRI brain scan here
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--color-slate-500)", maxWidth: 360 }}>
                or click to browse from your computer. Validated for square and rectangular dimensions.
              </div>
              <span className="btn btn-outline btn-sm" style={{ marginTop: 6 }}>
                Browse Files
              </span>
            </div>
          ) : (
            <div className="scan-preview-card">
              <img
                src={previewUrl}
                alt="Selected MRI Brain Scan"
                className="scan-thumb"
              />
              <div className="scan-meta">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleIcon size={18} style={{ color: "#10B981" }} />
                  <strong style={{ fontSize: "0.95rem", color: "var(--color-navy-900)" }}>
                    {file.name}
                  </strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-slate-500)" }}>
                  File Size: <strong>{fileSizeStr}</strong> &bull; Format: <strong>{file.type || "image/jpeg"}</strong>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-teal-600)", fontWeight: 600 }}>
                  Ready for tensor normalization (176x208x1) & deep learning inference
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace Image
                  </button>
                  <button
                    className="btn btn-danger-outline btn-sm"
                    onClick={handleRemoveImage}
                  >
                    <TrashIcon size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
          />

          {/* Inline Client Validation Error */}
          {clientError && (
            <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", color: "#991B1B", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} />
              <div>{clientError}</div>
            </div>
          )}

          {/* Inline Model Unavailable Notice */}
          {modelError && (
            <div style={{ marginTop: 16, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "16px", color: "#92400E", fontSize: "0.85rem" }}>
              <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AlertTriangleIcon size={18} />
                <span>Deep Learning Model Artifact Required</span>
              </div>
              <p style={{ lineHeight: 1.5, marginBottom: 8 }}>
                {modelError.instructions || "Trained weights for CNN + BiLSTM + Attention must be placed at the configured path."}
              </p>
              <div style={{ background: "rgba(0,0,0,0.05)", padding: "8px 12px", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                Target: {modelError.configured_path || "app/models/neuroscan_cnn_bilstm_attention.keras"}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={!file || isAnalyzing}
              onClick={handleAnalyze}
              style={{ minWidth: 200 }}
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner" />
                  <span>Processing Scan...</span>
                </>
              ) : (
                <>
                  <ActivityIcon size={18} />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Quick-Select Reference Scans Tray */}
          <SampleScansTray
            onSelectSample={handleSelectSample}
            selectedFilename={file?.name}
          />
        </div>
      </div>

      <ClinicalDisclaimer compact={true} />
    </div>
  );
}
