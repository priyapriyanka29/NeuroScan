/** Centered empty / no-data state with an optional call to action. */
export function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`px-4 py-14 text-center sm:py-16 ${className}`}>
      <div className="glow-ring mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-dim">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-mist">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-haze">{description}</p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
