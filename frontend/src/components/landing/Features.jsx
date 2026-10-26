import { BrainCircuit, Layers3, ScanEye, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Four-stage classification",
    body: "A single forward pass grades a T1-weighted scan as NonDemented, VeryMildDemented, MildDemented or ModerateDemented and returns the full softmax distribution — never just a label.",
    accent: "from-glow-cyan/25 to-glow-cyan/5 text-glow-cyan",
  },
  {
    icon: Layers3,
    title: "Attention-weighted features",
    body: "Convolutional blocks extract tissue boundaries, a bidirectional LSTM models spatial sequence across the slice, and a self-attention layer re-weights the regions that matter.",
    accent: "from-glow-blue/25 to-glow-blue/5 text-blue-300",
  },
  {
    icon: ScanEye,
    title: "Grad-CAM explainability",
    body: "Every prediction can be paired with a raw attention heatmap and an overlay on the original scan, generated from the model's own gradients — not a stylised illustration.",
    accent: "from-glow-violet/25 to-glow-violet/5 text-violet-300",
  },
  {
    icon: ShieldCheck,
    title: "Validated inputs, honest states",
    body: "Magic-byte signature checks, dimension bounds and a 10 MB cap run on the server; unsupported files, offline API and unavailable model weights each surface their own clear state.",
    accent: "from-glow-teal/25 to-glow-teal/5 text-teal-300",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow animate-fade-up">Capabilities</span>
        <h2 className="animate-fade-up stagger-1 mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Built for evidence, not vibes
        </h2>
        <p className="animate-fade-up stagger-2 mt-3 text-[0.95rem] leading-relaxed text-haze">
          Every panel in NeuroScan is wired to a real backend response. Nothing on screen is
          synthesised, cached or rounded up for effect.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((feature, idx) => (
          <article
            key={feature.title}
            className={`card card-hover glass-hover animate-fade-up stagger-${idx + 1} flex flex-col p-6`}
          >
            <div
              className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent}`}
            >
              <feature.icon size={21} />
            </div>
            <h3 className="text-[0.98rem] font-bold text-mist">{feature.title}</h3>
            <p className="mt-2.5 text-[0.83rem] leading-relaxed text-haze">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
