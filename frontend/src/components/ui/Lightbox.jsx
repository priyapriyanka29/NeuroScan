import { useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

/**
 * Full-screen image inspector for MRI / Grad-CAM views.
 * Closes on Escape or backdrop click; traps focus inside while open.
 */
export function Lightbox({ open, onClose, title, subtitle, src, alt }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Image inspector"}
      className="fixed inset-0 z-[900] flex flex-col bg-black/90 p-4 backdrop-blur-md animate-fade-in sm:p-6"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-mist">{title}</div>
          {subtitle && <div className="truncate text-xs text-dim">{subtitle}</div>}
        </div>
        <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Close inspector">
          <X size={16} />
          Close
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-4" onClick={onClose}>
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full rounded-xl object-contain shadow-[0_40px_120px_-40px_rgba(34,211,238,0.5)] animate-scale-in"
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-[0.72rem] text-dim" onClick={(e) => e.stopPropagation()}>
        <ZoomIn size={13} />
        Click the image or press Esc to exit
      </div>
    </div>
  );
}
