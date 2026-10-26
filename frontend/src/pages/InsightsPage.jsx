import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Layers,
  RefreshCw,
  ScanEye,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { Alert } from "../components/ui/Alert";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { STAGE_META, STAGE_ORDER } from "../app/navigation";
import { fetchModelEvaluation } from "../services/api";
import { useApp } from "../context/app-context";

const ROLES = [
  {
    icon: Layers,
    title: "Convolutional feature extraction",
    body: "Stacked Conv2D blocks build hierarchical maps of tissue boundaries, ventricular shape and grey/white-matter contrast from the input slice.",
  },
  {
    icon: GitBranch,
    title: "Bidirectional sequence modelling",
    body: "A BiLSTM reads the feature sequence forwards and backwards, preserving context in both spatial directions before pooling.",
  },
  {
    icon: BrainCircuit,
    title: "Self-attention weighting",
    body: "Attention scores re-weight feature positions so morphologically salient regions dominate the final representation.",
  },
  {
    icon: ScanEye,
    title: "Grad-CAM explainability",
    body: "Gradients of the predicted class flow back into the last convolutional layer to localise which pixels influenced the decision.",
  },
];

const PIPELINE = [
  { label: "Input", detail: "scan tensor" },
  { label: "CNN", detail: "spatial features" },
  { label: "BiLSTM", detail: "sequence context" },
  { label: "Attention", detail: "region weighting" },
  { label: "Softmax", detail: "4-class output" },
  { label: "Grad-CAM", detail: "attention map" },
];

function MetricTile({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.03] p-5">
      <div className="page-title-eyebrow">{label}</div>
      <div className={`mt-2 text-3xl font-extrabold tracking-tight ${accent}`}>{value}</div>
    </div>
  );
}

export function InsightsPage() {
  const { health } = useApp();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchModelEvaluation();
    if (res.ok) {
      setEvaluation(res.data);
    } else {
      setError(res.error || "Request failed");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const model = health?.model;
  const classes = health?.constraints?.classes ?? STAGE_ORDER;
  const metrics = evaluation?.evaluated ? evaluation.metrics : null;
  const report = metrics?.classification_report;

  return (
    <div className="flex flex-col gap-6">
      {/* Architecture */}
      <Card className="animate-fade-up">
        <CardHeader
          icon={<BrainCircuit size={19} className="text-glow-cyan" />}
          title="Network architecture"
          subtitle={
            health
              ? `Reported by the API: ${model?.architecture ?? health.constraints?.architecture}`
              : "Backend not reachable — showing documented architecture"
          }
          actions={
            <Link to="/app/analyze" className="btn btn-secondary btn-sm">
              Run an inference
              <ArrowRight size={14} />
            </Link>
          }
        />
        <CardBody>
          <div className="flex flex-wrap items-stretch gap-2.5">
            {PIPELINE.map((node, idx) => (
              <div key={node.label} className="flex items-center gap-2.5">
                <div className="glass-soft min-w-[7rem] px-3.5 py-3 text-center">
                  <div className="text-[0.8rem] font-bold text-mist">{node.label}</div>
                  <div className="mt-0.5 font-mono text-[0.62rem] text-glow-cyan">{node.detail}</div>
                </div>
                {idx < PIPELINE.length - 1 && (
                  <ArrowRight size={14} className="shrink-0 text-dim" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ROLES.map((role, idx) => (
              <div
                key={role.title}
                className={`rounded-2xl border border-line bg-white/[0.03] p-4 animate-fade-up stagger-${idx + 1}`}
              >
                <div className="flex items-center gap-2.5">
                  <role.icon size={17} className="text-glow-cyan" />
                  <h3 className="text-[0.88rem] font-bold text-mist">{role.title}</h3>
                </div>
                <p className="mt-2 text-[0.79rem] leading-relaxed text-haze">{role.body}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Deployment facts */}
        <Card className="animate-fade-up stagger-1">
          <CardHeader
            icon={<Database size={18} className="text-violet-300" />}
            title="Deployed artifact"
            subtitle="Live values from GET /api/health"
          />
          <CardBody className="space-y-4">
            <dl className="space-y-2.5 text-[0.82rem]">
              {[
                ["Status", model ? `${model.status_code}` : health ? "—" : "backend unreachable"],
                ["Weights file", model?.file_exists ? "present" : model ? "missing" : "—"],
                ["Input shape", model?.input_shape ? model.input_shape.join(" × ") : "—"],
                ["Grad-CAM layer", model?.gradcam_layer ?? "—"],
                ["API version", health?.version ? `v${health.version}` : "—"],
                ["Max upload", health?.constraints ? `${health.constraints.max_file_size_mb} MB` : "—"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-dim">{term}</dt>
                  <dd className="mono min-w-0 truncate text-right text-mist">{value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="page-title-eyebrow mb-2">Output classes</div>
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div
                    key={cls}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: STAGE_META[cls]?.color ?? "#22d3ee",
                        boxShadow: `0 0 10px ${STAGE_META[cls]?.color ?? "#22d3ee"}`,
                      }}
                    />
                    <span className="mono text-[0.78rem] text-mist">{cls}</span>
                    <span className="ml-auto truncate text-right text-[0.72rem] text-dim">
                      {STAGE_META[cls]?.label ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Evaluation metrics */}
        <Card className="animate-fade-up stagger-2">
          <CardHeader
            icon={<Timer size={18} className="text-glow-cyan" />}
            title="Evaluation metrics"
            subtitle="Published by the backend evaluation artifact"
            actions={
              <button className="btn btn-secondary btn-sm" onClick={loadEvaluation} disabled={loading}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Reload
              </button>
            }
          />
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" label="Querying evaluation repository…" />
              </div>
            ) : error ? (
              <Alert tone="error" title="Could not load metrics">
                {typeof error === "string" ? error : "The evaluation endpoint did not respond."}
                <div className="mt-3">
                  <button className="btn btn-secondary btn-sm" onClick={loadEvaluation}>
                    <RefreshCw size={13} />
                    Retry
                  </button>
                </div>
              </Alert>
            ) : metrics ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <MetricTile
                    label="Accuracy"
                    value={`${(metrics.accuracy * 100).toFixed(1)}%`}
                    accent="text-glow-cyan"
                  />
                  <MetricTile
                    label="Macro F1"
                    value={`${(metrics.macro_f1 * 100).toFixed(1)}%`}
                    accent="text-violet-300"
                  />
                  <MetricTile
                    label="Samples"
                    value={metrics.total_samples ?? "—"}
                    accent="text-mist"
                  />
                </div>

                {report && (
                  <div className="mt-5 space-y-3">
                    <div className="page-title-eyebrow">Per-class F1</div>
                    {Object.entries(report).map(([cls, row]) => (
                      <div key={cls}>
                        <div className="mb-1 flex justify-between text-[0.76rem]">
                          <span className="text-haze">{cls}</span>
                          <span className="mono text-mist">{(row.f1_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.f1_score * 100}%`,
                              background: STAGE_META[cls]?.color ?? "#22d3ee",
                              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <TriangleAlert size={24} />
                </div>
                <h3 className="text-lg font-bold text-mist">Not evaluated yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[0.84rem] leading-relaxed text-haze">
                  {evaluation?.message ||
                    "No evaluation artifact has been published, so no accuracy, precision, recall or F1 figures are shown. NeuroScan never invents benchmark numbers."}
                </p>

                {evaluation?.instructions && (
                  <ol className="mx-auto mt-5 max-w-lg space-y-1.5 rounded-2xl border border-line bg-white/[0.03] p-4 text-left text-[0.78rem] text-haze">
                    {evaluation.instructions.split("\n").map((line, idx) => (
                      <li key={idx} className="flex gap-2">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-glow-cyan" />
                        <span>{line.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Research context */}
      <Card className="animate-fade-up stagger-3">
        <CardHeader
          icon={<BookOpen size={18} className="text-glow-teal" />}
          title="Research context"
          subtitle="Documented project background — not a performance claim"
        />
        <CardBody className="grid gap-5 text-[0.85rem] leading-relaxed text-haze md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[0.9rem] font-bold text-mist">Dataset lineage</h3>
            <p>
              The model is trained on a public multiclass Alzheimer&apos;s MRI dataset derived from{" "}
              <strong className="text-mist">OASIS</strong> (Open Access Series of Imaging Studies)
              and <strong className="text-mist">ADNI</strong> (Alzheimer&apos;s Disease
              Neuroimaging Initiative). Training-set sizes and split ratios are properties of the
              training pipeline and are not reported by this API, so they are not shown here.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-[0.9rem] font-bold text-mist">Status of this build</h3>
            <p>
              An educational and research prototype. It has no clinical validation, no regulatory
              clearance and no prospective study behind it. Outputs exist to demonstrate the
              deep-learning imaging workflow, and must not be used for patient-facing decisions.
            </p>
            <Link to="/app/settings" className="btn btn-secondary btn-sm mt-3">
              Connection &amp; app settings
              <ArrowRight size={14} />
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="animate-fade-up stagger-4">
        <ClinicalDisclaimer />
      </div>
    </div>
  );
}
