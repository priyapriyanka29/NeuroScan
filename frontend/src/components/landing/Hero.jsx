import { Link } from "react-router-dom";
import { ArrowRight, Play, ScanLine, Layers, Sparkles } from "lucide-react";

/**
 * Animated neural-network motif rendered as inline SVG.
 * Purely decorative — no data, no fabricated metrics.
 */
function NeuralMotif() {
  const nodes = [
    { x: 40, y: 60 },
    { x: 40, y: 130 },
    { x: 40, y: 200 },
    { x: 130, y: 45 },
    { x: 130, y: 100 },
    { x: 130, y: 155 },
    { x: 130, y: 215 },
    { x: 220, y: 75 },
    { x: 220, y: 130 },
    { x: 220, y: 185 },
    { x: 310, y: 105 },
    { x: 310, y: 160 },
  ];
  const edges = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 3; j < 7; j++) edges.push([i, j]);
  }
  for (let i = 3; i < 7; i++) {
    for (let j = 7; j < 10; j++) if ((i + j) % 2 === 0) edges.push([i, j]);
  }
  for (let i = 7; i < 10; i++) {
    for (let j = 10; j < 12; j++) edges.push([i, j]);
  }

  return (
    <svg viewBox="0 0 350 260" className="h-full w-full" role="img" aria-label="Decorative neural network illustration">
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="nodeGrad">
          <stop offset="0%" stopColor="#e8faff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </radialGradient>
        <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {edges.map(([a, b], idx) => (
          <line
            key={idx}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#edgeGrad)"
            strokeWidth="1"
            strokeDasharray="6 8"
            opacity="0.5"
            style={{
              animation: `dash-draw ${3 + (idx % 5) * 0.4}s linear infinite`,
              strokeDashoffset: 0,
            }}
          />
        ))}
      </g>

      <g filter="url(#softGlow)">
        {nodes.map((n, idx) => (
          <circle
            key={idx}
            cx={n.x}
            cy={n.y}
            r={idx > 9 ? 7 : idx > 6 ? 6 : 5}
            fill="url(#nodeGrad)"
            opacity="0.95"
            style={{
              animation: `pulse-dot ${2.4 + (idx % 4) * 0.5}s ease-in-out ${idx * 0.12}s infinite`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

const FACTS = [
  { icon: Layers, label: "4 clinical stages", detail: "Non → Moderate" },
  { icon: ScanLine, label: "Grad-CAM maps", detail: "Per inference" },
  { icon: Sparkles, label: "CNN + BiLSTM", detail: "+ self-attention" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="neural-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-glow-cyan/10 blur-[120px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <span className="eyebrow animate-fade-up">
            <Sparkles size={13} />
            AI-assisted Alzheimer&apos;s MRI classification
          </span>

          <h1 className="animate-fade-up stagger-1 mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            See Beyond <span className="text-gradient">the Scan.</span>
          </h1>

          <p className="animate-fade-up stagger-2 mt-6 max-w-xl text-[1.02rem] leading-relaxed text-haze">
            NeuroScan reads T1-weighted brain MRI scans with a convolutional–bidirectional
            attention network, grades them across four Alzheimer&apos;s stages and shows you
            exactly which regions drove the decision through Grad-CAM attention maps.
          </p>

          <div className="animate-fade-up stagger-3 mt-8 flex flex-wrap gap-3">
            <Link to="/app/analyze" className="btn btn-primary btn-lg">
              <Play size={17} />
              Analyze MRI Scan
            </Link>
            <a href="#technology" className="btn btn-secondary btn-lg">
              Explore Technology
              <ArrowRight size={17} />
            </a>
          </div>

          <dl className="animate-fade-up stagger-4 mt-10 grid max-w-lg grid-cols-3 gap-3">
            {FACTS.map((fact) => (
              <div key={fact.label} className="glass-soft px-3 py-3 text-center">
                <fact.icon size={16} className="mx-auto mb-1.5 text-glow-cyan" />
                <dt className="text-[0.74rem] font-bold text-mist">{fact.label}</dt>
                <dd className="text-[0.66rem] text-dim">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up stagger-2 relative">
          <div className="glow-ring glass relative mx-auto aspect-[4/3] w-full max-w-xl p-5 animate-float">
            <div className="absolute inset-0 overflow-hidden rounded-[20px]" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-br from-glow-cyan/10 via-transparent to-glow-violet/10" />
            </div>
            <div className="relative h-full w-full">
              <NeuralMotif />
            </div>
            <div className="absolute right-4 bottom-4 rounded-lg border border-glow-cyan/30 bg-void/80 px-2.5 py-1.5 font-mono text-[0.66rem] text-glow-cyan backdrop-blur">
              conv → bilstm → attention → softmax
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
