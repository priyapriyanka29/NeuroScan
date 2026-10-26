import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const TONES = {
  info: { wrapper: "border-glow-cyan/30 bg-glow-cyan/10 text-cyan-100", icon: "text-glow-cyan", Icon: Info },
  success: { wrapper: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100", icon: "text-emerald-300", Icon: CheckCircle2 },
  warning: { wrapper: "border-amber-400/30 bg-amber-400/10 text-amber-100", icon: "text-amber-300", Icon: AlertTriangle },
  error: { wrapper: "border-red-400/30 bg-red-400/10 text-red-100", icon: "text-red-300", Icon: XCircle },
};

export function Alert({ tone = "info", title, children, className = "", actions }) {
  const { wrapper, icon, Icon } = TONES[tone] || TONES.info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[0.85rem] leading-relaxed backdrop-blur-md ${wrapper} ${className}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${icon}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-0.5 font-bold">{title}</p>}
        <div className="text-inherit opacity-90">{children}</div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
