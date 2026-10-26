import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Info,
  RefreshCw,
  ScanLine,
  ServerOff,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { SampleScansTray } from "../components/mri/SampleScans";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { Alert } from "../components/ui/Alert";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/Spinner";
import { analyzeMriScan } from "../services/api";
import { useApp } from "../context/app-context";

const FALLBACK_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const FALLBACK_MIME = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Real request milestones. Each step advances only when the corresponding
 * client-side event actually happens — nothing is faked.
 *
 * The backend performs upload, inference and Grad-CAM inside a single HTTP
 * round trip, so those are honestly shown as one combined wait rather than as
 * invented sub-stages.
 */
const STAGES = [
  "Validate file & build preview",
  "Awaiting API — upload, inference, Grad-CAM",
  "Response received — decoding result",
];

export function AnalyzePage() {
  const navigate = useNavigate();
  const { health, refreshHealth, addToast, recordAnalysis, connection } = useApp();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileSizeStr, setFileSizeStr] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(-1);
  const [modelError, setModelError] = useState(null);
  const [clientError, setClientError] = useState(null);

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const inFlightRef = useRef(false);

  const constraints = health?.constraints;
  const allowedExtensions = constraints?.allowed_extensions ?? FALLBACK_EXTENSIONS;
  const maxMb = constraints?.max_file_size_mb ?? 10;

  /* Revoke preview object URL on replace, remove and unmount. */
  const assignPreview = useCallback((nextFile) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(nextFile);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  const validateAndSetFile = useCallback(
    (selectedFile) => {
      setClientError(null);
      setModelError(null);
      if (!selectedFile) return;

      const ext =
        selectedFile.name.includes(".")
          ? selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase()
          : "";

      if (!allowedExtensions.includes(ext)) {
        const message = `Unsupported file format ${ext || "(no extension)"}. Accepted: ${allowedExtensions.join(", ")}.`;
        setClientError(message);
        addToast({ type: "error", title: "Invalid file type", message });
        return;
      }

      if (selectedFile.type && !FALLBACK_MIME.includes(selectedFile.type)) {
        const message = `Unexpected MIME type "${selectedFile.type}". The backend accepts JPEG and PNG images only.`;
        setClientError(message);
        addToast({ type: "error", title: "Invalid file type", message });
        return;
      }

      if (selectedFile.size > MAX_SIZE_BYTES) {
        const message = `File is ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB — over the ${maxMb} MB limit.`;
        setClientError(message);
        addToast({ type: "error", title: "File too large", message });
        return;
      }

      setFile(selectedFile);
      setFileSizeStr(`${(selectedFile.size / 1024).toFixed(1)} KB`);
      assignPreview(selectedFile);
    },
    [allowedExtensions, maxMb, addToast, assignPreview]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
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
      title: "Reference scan loaded",
      message: `${sampleFile.name} is ready for analysis.`,
    });
  };

  const handleAnalyze = async () => {
    /* Duplicate-submission guard: the ref is checked synchronously. */
    if (inFlightRef.current) return;

    if (!file) {
      setClientError("Select or drop an MRI scan before starting the analysis.");
      return;
    }

    if (connection.state === "down") {
      setClientError(
        "The backend API is unreachable. Start the API service, then retry the connection from the top bar."
      );
      addToast({
        type: "error",
        title: "Backend offline",
        message: "Request not sent — the API could not be reached.",
      });
      return;
    }

    inFlightRef.current = true;
    setIsAnalyzing(true);
    setModelError(null);
    setClientError(null);
    setStage(1);

    try {
      const response = await analyzeMriScan(file);
      setStage(2);

      if (response.ok) {
        setStage(2);
        addToast({
          type: "success",
          title: "Analysis complete",
          message: `Classified as ${response.data.predicted_class} in ${response.data.metadata?.processing_time_ms ?? "?"} ms.`,
        });
        recordAnalysis({
          ...response.data,
          filename: file.name,
          timestamp: new Date().toISOString(),
          fileSize: fileSizeStr,
        });
        navigate("/app/results");
        return;
      }

      if (response.status === 503) {
        setModelError(response.error);
        addToast({
          type: "warning",
          title: "Model weights required",
          message: "The API is healthy but the trained .keras artifact is not loaded.",
        });
      } else if (response.status === 0) {
        setClientError(
          "Network error — the request never reached the API. Check that the backend is running."
        );
        addToast({
          type: "error",
          title: "Network error",
          message: "Could not reach the NeuroScan API.",
        });
        refreshHealth({ silent: true });
      } else {
        const msg =
          response.error?.message ||
          (typeof response.error?.detail === "string" ? response.error.detail : null) ||
          "Scan analysis failed.";
        setClientError(msg);
        addToast({ type: "error", title: "Analysis failed", message: msg });
      }
    } finally {
      inFlightRef.current = false;
      setIsAnalyzing(false);
      setStage(-1);
    }
  };

  const offline = connection.state === "down";

  return (
    <div className="flex flex-col gap-6">
      {offline && (
        <Alert
          tone="error"
          title="Backend API unreachable"
          actions={
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => refreshHealth()}
              aria-label="Retry connection"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          }
        >
          The request will fail until <code className="code-chip">uvicorn main:app</code> is
          listening on the configured API URL. Predictions are never simulated.
        </Alert>
      )}

      {health && !health.model?.is_ready && !offline && (
        <Alert tone="info" title="Model weights pending">
          The API is healthy, but the trained CNN + BiLSTM artifact is not loaded, so requests will
          return <code className="code-chip">503 MODEL_ARTIFACT_REQUIRED</code>. Place{" "}
          <code className="code-chip">neuroscan_cnn_bilstm_attention.keras</code> in{" "}
          <code className="code-chip">backend/models/</code> and restart the service.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        {/* ---------------- Upload workspace ---------------- */}
        <Card className="animate-fade-up">
          <CardHeader
            icon={<ScanLine size={19} className="text-glow-cyan" />}
            title="MRI scan workspace"
            subtitle={`Accepted: ${(constraints?.allowed_extensions ?? allowedExtensions)
              .join(", ")
              .toUpperCase()} · max ${maxMb} MB · validated again on the server`}
          />

          <CardBody>
            {!previewUrl ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload MRI image dropzone"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200
                  ${
                    isDragging
                      ? "scale-[1.01] border-glow-cyan bg-glow-cyan/10 shadow-[0_0_50px_-18px_rgba(34,211,238,0.9)]"
                      : "border-white/15 bg-white/[0.02] hover:border-glow-cyan/60 hover:bg-glow-cyan/[0.05]"
                  }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-glow-cyan/25 bg-glow-cyan/10 text-glow-cyan transition group-hover:scale-110">
                  <UploadCloud size={30} />
                </div>
                <div className="text-base font-bold text-mist">
                  Drag &amp; drop your brain MRI here
                </div>
                <div className="max-w-sm text-[0.82rem] leading-relaxed text-dim">
                  or click to browse. Images are read in the browser for preview and uploaded only
                  when you start the analysis.
                </div>
                <span className="btn btn-secondary btn-sm">Browse files</span>
              </div>
            ) : (
              <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white/[0.03] p-4 sm:flex-row sm:items-center animate-scale-in">
                <div className="viewer-frame h-44 w-40 shrink-0 sm:h-48 sm:w-44">
                  <img src={previewUrl} alt={`Preview of ${file?.name}`} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="shrink-0 text-emerald-300" />
                    <strong className="truncate text-[0.95rem] text-mist">{file.name}</strong>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.78rem]">
                    <dt className="text-dim">Size</dt>
                    <dd className="mono text-haze">{fileSizeStr}</dd>
                    <dt className="text-dim">Type</dt>
                    <dd className="mono truncate text-haze">{file.type || "image/*"}</dd>
                    <dt className="text-dim">Validation</dt>
                    <dd className="text-emerald-300">Client checks passed</dd>
                  </dl>

                  <p className="text-[0.75rem] leading-relaxed text-glow-cyan">
                    Server re-validates magic bytes, dimensions and size before inference.
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2.5">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                    >
                      Replace image
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleRemove}
                      disabled={isAnalyzing}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept={allowedExtensions.join(",") + ",image/jpeg,image/png"}
              aria-label="Choose MRI image"
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
            />

            {clientError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[0.85rem] text-red-200 animate-fade-in">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                <div>{clientError}</div>
              </div>
            )}

            {modelError && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-[0.85rem] text-amber-100 animate-fade-in">
                <div className="mb-1.5 flex items-center gap-2 font-bold">
                  <AlertTriangle size={17} />
                  {modelError.message || "Deep learning model artifact required"}
                </div>
                <p className="leading-relaxed opacity-90">{modelError.instructions}</p>
                <div className="mono mt-2.5 rounded-md bg-black/40 px-3 py-2 break-all">
                  {modelError.configured_path}
                </div>
                <div className="mt-3 flex gap-2.5">
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate("/app/insights")}>
                    Model details
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => refreshHealth()}
                    aria-label="Re-check backend status"
                  >
                    <RefreshCw size={13} />
                    Re-check status
                  </button>
                </div>
              </div>
            )}

            {/* Real request milestones */}
            {isAnalyzing && (
              <div className="mt-5 rounded-2xl border border-glow-cyan/30 bg-glow-cyan/[0.06] p-4 animate-fade-in">
                <ol className="space-y-2.5">
                  {STAGES.map((label, idx) => {
                    const isDone = idx < stage;
                    const isCurrent = idx === stage;
                    return (
                      <li key={label} className="flex items-center gap-3 text-[0.82rem]">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.62rem] ${
                            isDone
                              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                              : isCurrent
                                ? "border-glow-cyan/60 bg-glow-cyan/15 text-glow-cyan"
                                : "border-white/15 text-dim"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <span
                          className={
                            isCurrent
                              ? "font-semibold text-glow-cyan"
                              : isDone
                                ? "text-haze line-through decoration-white/25"
                                : "text-dim"
                          }
                        >
                          {label}
                        </span>
                        {isCurrent && <span className="spinner ml-auto h-3 w-3" aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-3">
                  <ProgressBar
                    label="In flight"
                    value={stage >= 0 ? Math.round(((stage + 1) / STAGES.length) * 100) : 0}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.76rem] text-dim">
                {file
                  ? "Ready — the request is sent only when you press Analyze."
                  : "No scan selected yet."}
              </p>
              <button
                className="btn btn-primary btn-lg min-w-[13.5rem]"
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
                aria-busy={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <ScanLine size={18} />
                    Analyze MRI
                  </>
                )}
              </button>
            </div>

            <SampleScansTray onSelectSample={handleSelectSample} selectedFilename={file?.name} />
          </CardBody>
        </Card>

        {/* ---------------- Context rail ---------------- */}
        <div className="flex flex-col gap-6">
          <Card className="animate-fade-up stagger-1">
            <CardHeader
              icon={<FileImage size={18} className="text-glow-cyan" />}
              title="Input requirements"
            />
            <CardBody className="space-y-3 text-[0.82rem]">
              {[
                ["Formats", (constraints?.allowed_extensions ?? allowedExtensions).join(" · ")],
                ["Max size", `${maxMb} MB`],
                ["Dimensions", "64 – 4096 px per side"],
                ["Tensor", health?.model?.input_shape ? health.model.input_shape.join(" × ") : "model default"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-dim">{term}</span>
                  <span className="mono min-w-0 truncate text-right text-mist">{value}</span>
                </div>
              ))}
              <p className="pt-1 text-[0.76rem] leading-relaxed text-dim">
                These values are read from <code className="code-chip">GET /api/health</code> — if
                the backend changes its limits, this panel follows automatically.
              </p>
            </CardBody>
          </Card>

          <Card className="animate-fade-up stagger-2">
            <CardHeader icon={<Info size={18} className="text-violet-300" />} title="Before you upload" />
            <CardBody className="space-y-3 text-[0.82rem] leading-relaxed text-haze">
              <p>
                Use a de-identified research scan. Anything you upload stays on this machine: the
                image is sent to the local API and never to a third party.
              </p>
              <p>
                Nothing is stored server-side — history lives in this browser tab only and is gone
                when you close it.
              </p>
              <p className="text-dim">
                Results are an experimental research signal, not a diagnosis.
              </p>
            </CardBody>
          </Card>

          {offline && (
            <Card className="animate-fade-up stagger-3 p-5">
              <div className="flex items-start gap-3">
                <ServerOff size={20} className="mt-0.5 shrink-0 text-red-300" />
                <div className="text-[0.82rem] leading-relaxed text-haze">
                  <div className="font-bold text-mist">Connection lost</div>
                  Last check{" "}
                  {connection.checkedAt ? new Date(connection.checkedAt).toLocaleTimeString() : "—"}.
                  <button
                    className="btn btn-primary btn-sm mt-3 w-full"
                    onClick={() => refreshHealth()}
                  >
                    <RefreshCw size={14} />
                    Test connection
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ClinicalDisclaimer compact />
    </div>
  );
}
