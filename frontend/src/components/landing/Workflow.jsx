import { UploadCloud, SlidersHorizontal, Cpu, Eye } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload",
    body: "Drop a JPG or PNG brain scan into the analysis workspace, or load a bundled reference sample.",
  },
  {
    icon: SlidersHorizontal,
    title: "Validate & preprocess",
    body: "The API verifies magic bytes, dimensions and size, then resizes and normalises the image to the model's input tensor.",
  },
  {
    icon: Cpu,
    title: "Inference",
    body: "CNN → BiLSTM → self-attention → softmax. Class probabilities and timing metadata come straight from the response.",
  },
  {
    icon: Eye,
    title: "Visualise",
    body: "Inspect the classification, score distribution, and the Grad-CAM attention map beside the original MRI.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="scroll-mt-24 border-y border-line bg-white/[0.02]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow animate-fade-up">Workflow</span>
          <h2 className="animate-fade-up stagger-1 mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            From upload to explanation in four steps
          </h2>
        </div>

        <ol className="relative mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* connecting rail */}
          <div
            aria-hidden="true"
            className="absolute top-8 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-glow-cyan/40 to-transparent xl:block"
          />
          {STEPS.map((step, idx) => (
            <li
              key={step.title}
              className={`card animate-fade-up stagger-${idx + 1} relative p-6`}
            >
              <div className="relative z-10 mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-glow-cyan/30 bg-void text-glow-cyan shadow-[0_0_24px_-8px_rgba(34,211,238,0.8)]">
                  <step.icon size={20} />
                </span>
                <span className="font-mono text-[0.7rem] tracking-widest text-dim">
                  STEP {idx + 1}
                </span>
              </div>
              <h3 className="text-[0.96rem] font-bold text-mist">{step.title}</h3>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-haze">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
