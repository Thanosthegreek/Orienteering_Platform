import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "default" | "success" | "error" | "warning";
export type Toast = {
  id: number;
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastCtx = {
  push: (t: Omit<Toast, "id">) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = nextId.current++;
    const toast: Toast = { id, ...t };
    setToasts(prev => [...prev, toast]);
    const dur = toast.durationMs ?? (toast.variant === "error" ? 6000 : 3500);
    const timer = setTimeout(() => dismiss(id), dur);
    // if unmounted, timers go away anyway
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onClose }: { toasts: Toast[]; onClose: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        display: "grid",
        gap: 8,
        zIndex: 1000,
        maxWidth: 380,
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            background:
              t.variant === "success" ? "#e8fff1" :
              t.variant === "error" ? "#ffe8e8" :
              t.variant === "warning" ? "#fff6e5" :
              "#f6f6f6",
            border:
              t.variant === "success" ? "1px solid #2ecc71" :
              t.variant === "error" ? "1px solid #e74c3c" :
              t.variant === "warning" ? "1px solid #f39c12" :
              "1px solid #ddd",
          }}
        >
          {!!t.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>}
          <div style={{ whiteSpace: "pre-wrap" }}>{t.message}</div>
          <button
            onClick={() => onClose(t.id)}
            style={{
              marginTop: 6,
              fontSize: 12,
              background: "transparent",
              border: "none",
              color: "#555",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Dismiss"
            title="Dismiss"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
