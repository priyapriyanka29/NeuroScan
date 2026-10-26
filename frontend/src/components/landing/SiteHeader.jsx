import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Menu, X, Sparkles } from "lucide-react";

const SECTION_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#workflow", label: "Workflow" },
  { href: "#technology", label: "Technology" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label="NeuroScan home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-glow-cyan via-glow-blue to-glow-violet shadow-[0_8px_24px_-8px_rgba(34,211,238,0.7)]">
            <BrainCircuit size={19} className="text-void" strokeWidth={2.2} />
          </span>
          <span className="text-[1.02rem] font-extrabold tracking-tight text-mist">NeuroScan</span>
        </a>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Section navigation">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-haze transition hover:bg-white/5 hover:text-mist"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/app" className="btn btn-secondary btn-sm hidden sm:inline-flex">
            Dashboard
          </Link>
          <Link to="/app/analyze" className="btn btn-primary btn-sm">
            <Sparkles size={14} />
            Analyze MRI Scan
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="btn btn-secondary btn-sm md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile section navigation"
          className="border-t border-line bg-abyss/95 px-4 py-3 md:hidden animate-fade-in"
        >
          <div className="flex flex-col gap-1">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-haze transition hover:bg-white/5 hover:text-mist"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-glow-cyan transition hover:bg-white/5"
            >
              Open dashboard
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
