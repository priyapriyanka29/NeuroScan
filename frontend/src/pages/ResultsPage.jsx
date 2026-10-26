import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Download,
  Eye,
  Info,
  Maximize2,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Timer,
} from "lucide-react";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { DoctorDirectory } from "../components/referral/DoctorDirectory";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Lightbox } from "../components/ui/Lightbox";
import { FitImage } from "../components/ui/FitImage";
import { STAGE_META, STAGE_ORDER, stageColor } from "../app/navigation";
import { DIRECTORY_SOURCES, DOCTORS, REFERRAL_BY_STAGE } from "../data/doctors";
import { downloadJson } from "../app/download";
import { useApp } from "../context/app-context";

const VIEW_MODES = [
  { id: "overlay", label: "Overlay" },
  { id: "heatmap", label: "Heatmap" },
  { id: "compare", label: "Compare" },
];

function ConfidenceRing({ value, color }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value)));

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={`Confidence ${(value * 100).toFixed(1)} percent`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 10px ${color}aa)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-mist">
          {(value * 100).toFixed(1)}%
        </span>
        <span className="page-title-eyebrow mt-0.5">confidence</span>
      </div>
    </div>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { analysisResult } = useApp();
  const [viewMode, setViewMode] = useState("overlay");
  const [split, setSplit] = useState(50);
  const [lightbox, setLightbox] = useState(null);

  const result = analysisResult;

  const orderedScores = useMemo(() => {
    if (!result?.probabilities) return [];
    const keys = Object.keys(result.probabilities);
    const ordered = STAGE_ORDER.filter((k) => keys.includes(k));
    keys.filter((k) => !ordered.includes(k)).forEach((k) => ordered.push(k));
    return ordered.map((key) => ({ key, value: result.probabilities[key] }));
  }, [result]);

  if (!result) {
    return (
      <Card>
        <EmptyState
          icon={<Activity size={30} />}
          title="No results in this session"
          description="Prediction output appears here after you analyse a scan. Nothing is fabricated or replayed from a previous run."
          action={
            <Link to="/app/analyze" className="btn btn-primary">
              <ScanLine size={16} />
              Open MRI workspace
            </Link>
          }
        />
      </Card>
    );
  }

  const {
    predicted_class: predictedClass,
    confidence,
    original_image_base64: originalImage,
    gradcam = {},
    metadata = {},
    scan_quality: scanQuality,
    filename,
    fileSize,
    timestamp,
  } = result;

  const stageMeta = STAGE_META[predictedClass];
  const color = stageColor(predictedClass);
  const referral = REFERRAL_BY_STAGE[predictedClass] ?? REFERRAL_BY_STAGE.NonDemented;
  const gradcamReady = Boolean(gradcam.available);
  const stackedTotal = orderedScores.reduce((sum, s) => sum + (s.value || 0), 0) || 1;

  const downloadReport = () => {
    downloadJson(
      {
        generated_at: new Date().toISOString(),
        source_file: { name: filename ?? null, size: fileSize ?? null },
        result,
        referral: {
          disclaimer:
            "NeuroScan does not prescribe medication and cannot refer you. This block is signposting only — confirm credentials and appointments directly with the institution.",
          predicted_class: predictedClass,
          suggested_specialist: referral.specialist,
          urgency: referral.urgency,
          discussion_points: referral.questions,
          directory: {
            sources: DIRECTORY_SOURCES,
            doctors: DOCTORS.map((d) => ({
              name: d.name,
              qualifications: d.quals ?? d.qualsNote,
              specialty: d.specialty,
              designation: d.designation ?? null,
              institution: d.institution,
              city: d.city,
              evidence: d.evidence,
              evidence_note: d.evidenceNote,
              source: d.source,
              url: d.url,
            })),
          },
        },
      },
      `neuroscan-report-${(filename || "scan").replace(/\.[^.]+$/, "")}.json`
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- Verdict ---------------- */}
      <section className="glass glow-ring animate-fade-up relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-10 h-64 w-64 rounded-full blur-[90px]"
          style={{ background: `${color}22` }}
        />
        <div className="relative flex flex-col items-start gap-7 lg:flex-row lg:items-center">
          <ConfidenceRing value={confidence} color={color} />

          <div className="min-w-0 flex-1">
            <div className="page-title-eyebrow">Model classification</div>
            <div className="mt-2.5 flex flex-wrap items-center gap-4">
              <span className={`badge-stage stage-${predictedClass} text-lg px-4 py-2`}>
                {predictedClass}
              </span>
              <span className="mono text-[0.8rem] text-dim">
                {stageMeta?.label ?? "Unmapped class"}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-haze">
              {stageMeta?.interpretation ?? "No description available for this label."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.75rem] text-dim">
              <span className="inline-flex items-center gap-1.5">
                <Timer size={13} className="text-glow-cyan" />
                {metadata.processing_time_ms != null
                  ? `${metadata.processing_time_ms} ms server time`
                  : "Timing unavailable"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye size={13} className="text-violet-300" />
                Grad-CAM {gradcamReady ? "generated" : "unavailable"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={13} className="text-glow-teal" />
                {filename ? `Source: ${filename}` : "Unnamed scan"}
                {fileSize ? ` (${fileSize})` : ""}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 lg:w-auto">
            <button className="btn btn-primary" onClick={() => navigate("/app/analyze")}>
              <ScanLine size={16} />
              Analyze another scan
            </button>
            {gradcamReady && (
              <Link to="/app/gradcam" className="btn btn-secondary">
                <Eye size={16} />
                View explanation map
              </Link>
            )}
            <button className="btn btn-secondary" onClick={downloadReport}>
              <Download size={16} />
              Download report
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ---------------- Viewer ---------------- */}
        <Card className="animate-fade-up stagger-1">
          <CardHeader
            icon={<Eye size={18} className="text-glow-cyan" />}
            title="Scan & attention view"
            subtitle={
              <>
                {filename || "Uploaded scan"}
                {fileSize ? ` · ${fileSize}` : ""}
                {timestamp ? ` · ${new Date(timestamp).toLocaleString()}` : ""}
              </>
            }
            actions={
              gradcamReady ? (
                <div className="flex rounded-xl border border-line bg-white/5 p-1">
                  {VIEW_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      aria-pressed={viewMode === mode.id}
                      className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                        viewMode === mode.id
                          ? "bg-glow-cyan/90 text-void shadow-[0_6px_18px_-8px_rgba(34,211,238,0.9)]"
                          : "text-haze hover:text-mist"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              ) : null
            }
          />
          <CardBody>
            {gradcamReady ? (
              viewMode === "compare" ? (
                /* Drag/keyboard reveal: original underneath, attention map on top */
                <div className="mx-auto w-full max-w-[38rem]">
                  <div
                    className="viewer-frame aspect-[4/3] cursor-ew-resize select-none"
                    onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
                    onPointerMove={(e) => {
                      if (e.buttons !== 1) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = ((e.clientX - rect.left) / rect.width) * 100;
                      setSplit(Math.max(0, Math.min(100, pct)));
                    }}
                    role="slider"
                    tabIndex={0}
                    aria-label="Reveal original scan versus Grad-CAM overlay"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(split)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") setSplit((v) => Math.max(0, v - 5));
                      if (e.key === "ArrowRight") setSplit((v) => Math.min(100, v + 5));
                    }}
                  >
                    <img
                      src={originalImage}
                      alt="Original MRI scan"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                    >
                      <img
                        src={gradcam.overlay_base64}
                        alt="Grad-CAM overlay"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div
                      className="absolute inset-y-0 w-0.5 bg-glow-cyan shadow-[0_0_14px_rgba(34,211,238,0.9)]"
                      style={{ left: `${split}%` }}
                    />
                    <span className="absolute top-2 left-2.5 rounded bg-black/60 px-2 py-0.5 text-[0.62rem] font-semibold text-mist backdrop-blur">
                      Original
                    </span>
                    <span className="absolute top-2 right-2.5 rounded bg-black/60 px-2 py-0.5 text-[0.62rem] font-semibold text-glow-cyan backdrop-blur">
                      Grad-CAM
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[0.7rem] text-dim">
                    Drag the handle or focus it and press ← / →
                  </p>
                </div>
              ) : (
                /* Original is shown in every attention mode */
                <div className="grid gap-4 sm:grid-cols-2">
                  <FitImage
                    src={originalImage}
                    alt="Original MRI scan"
                    label="Original MRI"
                    onZoom={() =>
                      setLightbox({ src: originalImage, title: "Original MRI", alt: "Original MRI scan" })
                    }
                  />
                  <FitImage
                    src={viewMode === "heatmap" ? gradcam.heatmap_base64 : gradcam.overlay_base64}
                    alt={
                      viewMode === "heatmap" ? "Raw Grad-CAM heatmap" : "Grad-CAM overlay on MRI"
                    }
                    label={viewMode === "heatmap" ? "Grad-CAM heatmap" : "Grad-CAM overlay"}
                    onZoom={() =>
                      setLightbox({
                        src:
                          viewMode === "heatmap" ? gradcam.heatmap_base64 : gradcam.overlay_base64,
                        title:
                          viewMode === "heatmap" ? "Raw Grad-CAM heatmap" : "Grad-CAM overlay",
                        alt: "Grad-CAM attention map",
                      })
                    }
                  />
                </div>
              )
            ) : (
              <div>
                <FitImage
                  src={originalImage}
                  alt="Original MRI scan"
                  label="Original MRI"
                  className="mx-auto max-w-[22rem]"
                  onZoom={() =>
                    setLightbox({ src: originalImage, title: "Original MRI", alt: "Original MRI scan" })
                  }
                />
                <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.04] p-3 text-[0.8rem] text-haze">
                  <Info size={17} className="mt-0.5 shrink-0 text-glow-cyan" />
                  <div>
                    <strong className="text-mist">No attention map:</strong>{" "}
                    {gradcam.reason ||
                      "Grad-CAM requires a loaded convolutional model. The classification above still came from the live model."}
                  </div>
                </div>
              </div>
            )}

            {gradcamReady && viewMode === "heatmap" && (
              <div className="mt-3 flex items-center gap-3 text-[0.72rem] text-dim">
                <span>low contribution</span>
                <span
                  className="h-2.5 flex-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #00007f, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000, #7f0000)",
                  }}
                />
                <span>high contribution</span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ---------------- Scores & telemetry ---------------- */}
        <div className="flex flex-col gap-6">
          <Card className="animate-fade-up stagger-2">
            <CardHeader
              icon={<Activity size={18} className="text-glow-cyan" />}
              title="Class probability distribution"
              subtitle="Softmax output exactly as returned by the API"
            />
            <CardBody>
              {orderedScores.length > 0 ? (
                <>
                  {/* Whole-distribution strip: one bar spanning all four classes */}
                  <div className="rounded-2xl border border-line bg-white/[0.03] p-3.5">
                    <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="page-title-eyebrow">Whole distribution</span>
                      <span className="mono text-[0.66rem] text-dim">one bar · all 4 classes · 100%</span>
                    </div>
                    <div
                      className="flex h-4 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10 ring-inset"
                      role="img"
                      aria-label="Stacked probability distribution across the four classes"
                    >
                      {orderedScores.map((s) => (
                        <div
                          key={s.key}
                          title={`${s.key}: ${(s.value * 100).toFixed(2)}%`}
                          style={{
                            width: `${(s.value / stackedTotal) * 100}%`,
                            background: STAGE_META[s.key]?.color ?? "#22d3ee",
                            boxShadow: "inset -1px 0 0 rgba(0,0,0,0.5)",
                            transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="mono mt-1 flex justify-between text-[0.6rem] text-dim">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                      {orderedScores.map((s) => (
                        <span
                          key={s.key}
                          className="inline-flex items-center gap-1.5 text-[0.68rem] text-haze"
                        >
                          <span
                            className="h-2 w-2 rounded-[3px]"
                            style={{ background: STAGE_META[s.key]?.color ?? "#22d3ee" }}
                          />
                          {s.key}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ul className="mt-5 space-y-3.5">
                    {orderedScores.map((s) => {
                      const pct = s.value * 100;
                      const isTop = s.key === predictedClass;
                      const stageColorValue = STAGE_META[s.key]?.color ?? "#22d3ee";
                      return (
                        <li key={s.key}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                            <span className={isTop ? "font-bold text-mist" : "font-medium text-haze"}>
                              {s.key}
                              {isTop && (
                                <span className="ml-2 rounded border border-glow-cyan/40 bg-glow-cyan/10 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider text-glow-cyan uppercase">
                                  predicted
                                </span>
                              )}
                            </span>
                            <span className="mono text-mist">{pct.toFixed(2)}%</span>
                          </div>
                          <div className="relative h-3 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10 ring-inset">
                            {/* 50% scale tick so tiny fills can be judged */}
                            <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                minWidth: s.value > 0 ? 5 : undefined,
                                background: `linear-gradient(90deg, ${stageColorValue}cc, ${stageColorValue})`,
                                boxShadow: `0 0 12px -2px ${stageColorValue}`,
                                transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="py-3 text-sm text-dim">
                  The response contained no probability vector for this run.
                </p>
              )}
            </CardBody>
          </Card>

          <Card className="animate-fade-up stagger-3">
            <CardHeader
              icon={<Timer size={18} className="text-violet-300" />}
              title="Execution telemetry"
              subtitle="Values straight from the response payload"
            />
            <CardBody className="space-y-5">
              <dl className="grid grid-cols-2 gap-2.5 text-[0.78rem]">
                {[
                  ["Processing time", metadata.processing_time_ms != null ? `${metadata.processing_time_ms} ms` : "—", true],
                  ["Input tensor", metadata.input_shape ? metadata.input_shape.join(" × ") : "—", true],
                  ["Architecture", metadata.architecture ?? "—", false],
                  ["Model version", metadata.model_version ? `v${metadata.model_version}` : "—", true],
                ].map(([label, value, mono]) => (
                  <div key={label} className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
                    <dt className="text-dim">{label}</dt>
                    <dd className={`mt-0.5 font-bold ${mono ? "font-mono text-mist" : "text-glow-cyan"}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {scanQuality && (
                <div className="rounded-xl border border-line bg-white/[0.03] p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="page-title-eyebrow">Scan signal quality</span>
                    <span
                      className={`badge ${scanQuality.usable ? "badge-online" : "badge-offline"}`}
                    >
                      {scanQuality.usable ? "Usable" : "Rejected"}
                    </span>
                  </div>
                  <p className="text-[0.78rem] text-haze">{scanQuality.message}</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-[0.72rem] text-dim">
                    <span>
                      Mean intensity <span className="mono text-mist">{scanQuality.mean_intensity}</span>
                    </span>
                    <span>
                      Contrast σ <span className="mono text-mist">{scanQuality.contrast_std}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3.5">
                <ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-[0.78rem] leading-relaxed text-amber-100/90">
                  {metadata.disclaimer ||
                    "Experimental research output. Not a clinical diagnosis — a qualified radiologist must review any scan."}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="animate-fade-up stagger-4">
        <DoctorDirectory predictedClass={predictedClass} />
      </div>

      <div className="animate-fade-up stagger-4">
        <ClinicalDisclaimer />
      </div>

      <Lightbox
        open={Boolean(lightbox)}
        onClose={() => setLightbox(null)}
        title={lightbox?.title}
        subtitle={lightbox ? `${filename ?? ""} · predicted ${predictedClass}` : ""}
        src={lightbox?.src}
        alt={lightbox?.alt ?? "MRI image"}
      />
    </div>
  );
}
