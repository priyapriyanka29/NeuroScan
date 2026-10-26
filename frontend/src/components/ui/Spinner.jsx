export function Spinner({ label, size = "sm" }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-haze" role="status">
      <span className={size === "lg" ? "spinner spinner-lg" : "spinner"} />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

/** Indeterminate top-edge progress bar used while a request is in flight. */
export function ProgressBar({ label, value }) {
  return (
    <div className="w-full" role="status" aria-live="polite">
      <div className="mb-1.5 flex items-center justify-between text-[0.72rem] text-haze">
        <span>{label}</span>
        {value != null && <span className="mono">{value}%</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-glow-cyan to-glow-blue transition-[width] duration-500 ease-out"
          style={{ width: value == null ? "35%" : `${value}%` }}
        />
      </div>
    </div>
  );
}
