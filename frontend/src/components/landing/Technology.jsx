import { Link } from "react-router-dom";
import { ArrowRight, GitBranch } from "lucide-react";
import { STAGE_META, STAGE_ORDER } from "../../app/navigation";

const PIPELINE = [
  { label: "MRI input", detail: "128 × 128 × 3" },
  { label: "Conv blocks", detail: "spatial features" },
  { label: "BiLSTM", detail: "sequence context" },
  { label: "Self-attention", detail: "region weighting" },
  { label: "Softmax", detail: "4-class output" },
];

export function Technology() {
  return (
    <section id="technology" className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <span className="eyebrow animate-fade-up">Technology</span>
          <h2 className="animate-fade-up stagger-1 mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            One pipeline, end to end
          </h2>
          <p className="animate-fade-up stagger-2 mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-haze">
            The deployed model is a Keras graph combining convolutional feature extraction,
            bidirectional sequence modelling and self-attention pooling. Grad-CAM back-propagates
            from the predicted class into the final convolutional layer to produce the attention map.
          </p>

          {/* Architecture chain */}
          <div className="animate-fade-up stagger-3 mt-7 flex flex-wrap items-stretch gap-2.5">
            {PIPELINE.map((node, idx) => (
              <div key={node.label} className="flex items-center gap-2.5">
                <div className="glass-soft min-w-[7.5rem] px-3.5 py-3 text-center">
                  <div className="text-[0.8rem] font-bold text-mist">{node.label}</div>
                  <div className="mt-0.5 font-mono text-[0.64rem] text-glow-cyan">{node.detail}</div>
                </div>
                {idx < PIPELINE.length - 1 && (
                  <ArrowRight size={15} className="shrink-0 text-dim" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <div className="animate-fade-up stagger-4 mt-7 flex flex-wrap items-center gap-3">
            <Link to="/app/insights" className="btn btn-secondary">
              <GitBranch size={16} />
              Model insights &amp; metrics
            </Link>
            <span className="text-[0.78rem] text-dim">
              Verified evaluation figures appear only when the backend has published them.
            </span>
          </div>
        </div>

        {/* Supported classes */}
        <div className="card animate-fade-up stagger-3 p-6">
          <h3 className="text-[0.95rem] font-bold text-mist">Supported output classes</h3>
          <p className="mt-1 text-[0.8rem] text-dim">
            Labels exactly as returned by <code className="code-chip">GET /api/health</code>
          </p>
          <ul className="mt-4 space-y-3">
            {STAGE_ORDER.map((id) => (
              <li key={id} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: STAGE_META[id].color, boxShadow: `0 0 12px ${STAGE_META[id].color}` }}
                />
                <div className="min-w-0">
                  <div className="font-mono text-[0.8rem] font-semibold" style={{ color: STAGE_META[id].color }}>
                    {id}
                  </div>
                  <div className="text-[0.78rem] leading-relaxed text-haze">
                    {STAGE_META[id].summary}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
