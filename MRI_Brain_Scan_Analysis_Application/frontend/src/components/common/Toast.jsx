import { useEffect } from "react";
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon, InfoIcon, XIcon } from "../icons/Icons";

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircleIcon className="toast-icon text-emerald-500" />;
      case "error":
        return <XCircleIcon className="toast-icon text-red-500" />;
      case "warning":
        return <AlertTriangleIcon className="toast-icon text-amber-500" />;
      default:
        return <InfoIcon className="toast-icon text-cyan-500" />;
    }
  };

  return (
    <div className={`toast toast-${toast.type || "info"}`}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {toast.title && <div style={{ fontWeight: 600, marginBottom: 2 }}>{toast.title}</div>}
        <div style={{ color: "#334155", lineHeight: 1.4 }}>{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ color: "#94A3B8", padding: 2 }}
        aria-label="Dismiss notification"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
