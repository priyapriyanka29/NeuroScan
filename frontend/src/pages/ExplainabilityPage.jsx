import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  Info,
  Maximize2,
  ScanLine,
  SplitSquareHorizontal,
} from "lucide-react";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Lightbox } from "../components/ui/Lightbox";
import { useApp } from "../context/app-context";

const MODES = [
  { id: "overlay", label: "Overlay", icon: Eye },
  { id: "compare", label: "Compare", icon: SplitSquareHorizontal },
  { id: "heatmap", label: "Heatmap", icon: Info },
];

const LEGEND_STEPS = [
  {
    title: "Warm regions (red / yellow)",
    body: "Pixels that raised the logit score for the predicted class — where the network found evidence.",
    dot: "#f87171",
  },
  {
    title: "Cool regions (blue / violet)",
    body: "Structures with little or no gradient contribution to this particular decision.",
    dot: "#60a5fa",
  },
  {
    title: "Focus areas in Alzheimer's imaging",
    body: "Attention typically concentrates on medial temporal atrophy and lateral ventricular enlargement.",
    dot: "#22d3ee",
  },
];

const HOW_IT_WORKS = [
  ["1 · Final convolutional layer", "High-level spatial features (ventricle shape, sulcal width) before flattening."],
  ["2 · Gradient pooling", "Global average pooling weights each filter by its influence on the target class."],
  ["3 · ReLU + upsample", "Only positive contributions survive; the map is resized and overlaid on the MRI."],
];

export function ExplainabilityPage() {
  const navigate = useNavigate();
  const { analysisResult } = useApp();
  const [mode, setMode] = useState("overlay");
  const [split, setSplit] = useState(50);
  const [lightbox, setLightbox] = useState(null);
  const compareRef = useRef(null);

  const gradcam = analysisResult?.gradcam ?? {};
  const hasMap = Boolean(gradcam.available) && Boolean(analysisResult);

  /* Reset local view state when the underlying result changes. */
  useEffect(() => {
    setMode("overlay");
    setSplit(50);
  }, [analysisResult]);

  const handleCompareKey = (e) => {
    if (e.key === "ArrowLeft") setSplit((v) => Math.max(0, v - 5));
    if (e.key === "ArrowRight") setSplit((v) => Math.min(100, v + 5));
  };

  if (!hasMap) {
    const reason = analysisResult
      ? gradcam.reason ||
        "The backend did not return an attention map for this run."
      : "No scan has been analysed in this session yet, so there is nothing to explain.";

    return (
      <div className="flex flex-col gap-6">
        <Card>
          <EmptyState
            icon={<Eye size={28} />}
            title={analysisResult ? "Attention map unavailable" : "No active analysis"}
            description={reason}
            action={
              <Link to="/app/analyze" className="btn btn-primary">
                <ScanLine size={16} />
                Go to MRI workspace
              </Link>
            }
          />
        </Card>
        <ClinicalDisclaimer />
      </div>
    );
  }

  const { original_image_base64: original, overlay_base64: overlay, heatmap_base64: heatmap, target_layer } = gradcam;
  const predicted = analysisResult.predicted_class;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="glass animate-fade-up flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <span className="eyebrow">
            <Eye size={13} />
            Explainable AI
          </span>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight sm:text-2xl">
            Attention map for the current scan
          </h2>
          <p className="mt-1.5 max-w-2xl text-[0.85rem] leading-relaxed text-haze">
            Grad-CAM back-propagates from the predicted class into{" "}
            <code className="code-chip">{target_layer || "the final convolutional layer"}</code>,
            producing a spatial map of which regions drove{" "}
            <strong className="text-mist">{predicted}</strong>.
          </p>
        </div>
        <span className={`badge-stage stage-${predicted} shrink-0`}>{predicted}</span>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Viewer */}
        <Card className="animate-fade-up stagger-1">
          <CardHeader
            title="Original vs Grad-CAM"
            subtitle="Click the image for a full-screen inspection · Esc to exit"
            actions={
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-line bg-white/5 p-1">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      aria-pressed={mode === m.id}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                        mode === m.id
                          ? "bg-glow-cyan/90 text-void shadow-[0_6px_18px_-8px_rgba(34,211,238,0.9)]"
                          : "text-haze hover:text-mist"
                      }`}
                    >
                      <m.icon size={12} />
                      {m.label}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setLightbox({
                      src: mode === "heatmap" ? heatmap : overlay,
                      title: mode === "heatmap" ? "Raw Grad-CAM heatmap" : "Grad-CAM overlay",
                    })
                  }
                  aria-label="Open full screen"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            }
          />

          <CardBody>
            {mode === "compare" ? (
              <div
                ref={compareRef}
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
                aria-label="Reveal original versus Grad-CAM overlay"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(split)}
                onKeyDown={handleCompareKey}
              >
                <img src={original} alt="Original MRI scan" className="absolute inset-0 h-full w-full object-contain" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                >
                  <img src={overlay} alt="Grad-CAM overlay" className="h-full w-full object-contain" />
                </div>
                <div
                  className="absolute inset-y-0 w-0.5 bg-glow-cyan shadow-[0_0_14px_rgba(34,211,238,0.9)]"
                  style={{ left: `${split}%` }}
                />
                <div
                  className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-glow-cyan/70 bg-void/90 text-glow-cyan"
                  style={{ left: `${split}%` }}
                  aria-hidden="true"
                >
                  ↔
                </div>
                <span className="absolute top-2 left-2.5 rounded bg-black/60 px-2 py-0.5 text-[0.62rem] font-semibold text-mist backdrop-blur">
                  Original
                </span>
                <span className="absolute top-2 right-2.5 rounded bg-black/60 px-2 py-0.5 text-[0.62rem] font-semibold text-glow-cyan backdrop-blur">
                  Grad-CAM
                </span>
              </div>
            ) : mode === "heatmap" ? (
              <div>
                <button
                  className="viewer-frame aspect-[4/3] w-full cursor-zoom-in"
                  onClick={() => setLightbox({ src: heatmap, title: "Raw Grad-CAM heatmap" })}
                  aria-label="Enlarge raw heatmap"
                >
                  <img src={heatmap} alt="Raw Grad-CAM heatmap" />
                </button>
                <div className="mt-3 flex items-center gap-3 text-[0.7rem] text-dim">
                  <span>low</span>
                  <span
                    className="h-2.5 flex-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #00007f, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000, #7f0000)",
                    }}
                  />
                  <span>high</span>
                </div>
                <p className="mt-2 text-[0.72rem] text-dim">
                  Jet colour scale generated by the backend from the raw activation map — no
                  post-processing is applied in the browser.
                </p>
              </div>
            ) : (
              <button
                className="viewer-frame aspect-[4/3] w-full cursor-zoom-in"
                onClick={() => setLightbox({ src: overlay, title: "Grad-CAM overlay" })}
                aria-label="Enlarge Grad-CAM overlay"
              >
                <img src={overlay} alt="Grad-CAM overlay on the original MRI scan" />
              </button>
            )}
          </CardBody>
        </Card>

        {/* Legend + explanation */}
        <div className="flex flex-col gap-6">
          <Card className="animate-fade-up stagger-2">
            <CardHeader title="How to read this map" />
            <CardBody className="space-y-4">
              {LEGEND_STEPS.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span
                    className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ background: item.dot, boxShadow: `0 0 12px ${item.dot}` }}
                  />
                  <div>
                    <div className="text-[0.84rem] font-bold text-mist">{item.title}</div>
                    <p className="mt-0.5 text-[0.79rem] leading-relaxed text-haze">{item.body}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3.5">
                <Info size={16} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-[0.76rem] leading-relaxed text-amber-100/90">
                  Grad-CAM shows where the <em>model</em> looked. It is not evidence of pathology
                  and does not validate the prediction clinically.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="animate-fade-up stagger-3">
            <CardHeader title="Gradient path" subtitle="Three-stage computation" />
            <CardBody className="space-y-3">
              {HOW_IT_WORKS.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-xl border border-line bg-white/[0.03] px-3.5 py-3"
                >
                  <div className="text-[0.8rem] font-bold text-glow-cyan">{title}</div>
                  <p className="mt-1 text-[0.77rem] leading-relaxed text-haze">{body}</p>
                </div>
              ))}

              <button className="btn btn-secondary btn-sm w-full" onClick={() => navigate("/app/results")}>
                Back to results
                <ArrowRight size={14} />
              </button>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="animate-fade-up stagger-4">
        <ClinicalDisclaimer />
      </div>

      <Lightbox
        open={Boolean(lightbox)}
        onClose={() => setLightbox(null)}
        title={lightbox?.title}
        subtitle={lightbox ? `${analysisResult.filename ?? ""} · predicted ${predicted}` : ""}
        src={lightbox?.src}
        alt={lightbox?.alt ?? "Grad-CAM attention map"}
      />
    </div>
  );
}
