import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const TOAST_ICONS = {
  success: { Icon: CheckCircle2, className: "text-emerald-300" },
  error: { Icon: XCircle, className: "text-red-300" },
  warning: { Icon: AlertTriangle, className: "text-amber-300" },
  info: { Icon: Info, className: "text-glow-cyan" },
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 bottom-4 z-[1000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const { Icon, className } = TOAST_ICONS[toast.type] || TOAST_ICONS.info;

  return (
    <div className={`toast toast-${toast.type || "info"} pointer-events-auto`}>
      <Icon size={19} className={`mt-0.5 shrink-0 ${className}`} />
      <div className="min-w-0 flex-1">
        {toast.title && <div className="text-sm font-bold text-mist">{toast.title}</div>}
        <div className="mt-0.5 text-[0.8rem] leading-snug text-haze">{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 text-dim transition hover:bg-white/10 hover:text-mist"
      >
        <X size={15} />
      </button>
    </div>
  );
}
