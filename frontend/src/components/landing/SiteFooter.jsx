import { Link } from "react-router-dom";
import { BrainCircuit, GitBranch, GraduationCap } from "lucide-react";

const PRODUCT_LINKS = [
  { to: "/app", label: "Overview" },
  { to: "/app/analyze", label: "MRI Analysis" },
  { to: "/app/history", label: "Analysis History" },
  { to: "/app/insights", label: "Model Insights" },
  { to: "/app/settings", label: "Settings" },
];

const SECTION_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#workflow", label: "Workflow" },
  { href: "#technology", label: "Technology" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-abyss/60 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-glow-cyan via-glow-blue to-glow-violet">
              <BrainCircuit size={19} className="text-void" strokeWidth={2.2} />
            </span>
            <span className="text-[1.02rem] font-extrabold tracking-tight text-mist">NeuroScan</span>
          </div>
          <p className="mt-4 max-w-sm text-[0.83rem] leading-relaxed text-haze">
            AI-powered Alzheimer&apos;s disease staging from brain MRI, with Grad-CAM
            explainability. Built as an educational and research prototype for demonstrating
            deep-learning medical imaging workflows.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-white/5 px-2.5 py-1.5 text-[0.72rem] text-dim">
            <GraduationCap size={14} className="text-glow-cyan" />
            Final-year engineering research project
          </p>
        </div>

        <nav aria-label="Footer product links">
          <h3 className="page-title-eyebrow mb-3">Application</h3>
          <ul className="space-y-2">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[0.85rem] text-haze transition hover:text-glow-cyan"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer section links">
          <h3 className="page-title-eyebrow mb-3">On this page</h3>
          <ul className="space-y-2">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[0.85rem] text-haze transition hover:text-glow-cyan"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="page-title-eyebrow mt-6 mb-3">Stack</h3>
          <p className="font-mono text-[0.72rem] leading-relaxed text-dim">
            React 19 · Vite · Tailwind
            <br />
            FastAPI · TensorFlow/Keras
          </p>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-5 text-[0.75rem] text-dim sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            Research prototype — <strong className="text-amber-300">not a medical device</strong>.
            Predictions require review by a board-certified neuroradiologist.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <GitBranch size={13} /> NeuroScan · Local development build
          </p>
        </div>
      </div>
    </footer>
  );
}
