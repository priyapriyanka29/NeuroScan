/**
 * Accessible on/off switch backed by a real state value (role="switch").
 */
export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-mist">{label}</div>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-dim">{description}</p>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-50 ${
          checked
            ? "border-glow-cyan/60 bg-glow-cyan/40"
            : "border-line-strong bg-white/10"
        }`}
        style={{ borderColor: checked ? "rgba(34,211,238,0.6)" : "rgba(255,255,255,0.14)" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-mist transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
          style={{ height: "1.1rem", width: "1.1rem" }}
        />
      </button>
    </div>
  );
}
