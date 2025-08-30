// frontend/src/components/Toasts.tsx
import { useEffect } from "react";
import { useToasts } from "./ToastContext";
import type { Toast } from "./ToastContext";

function ToastCard({ t, onDone }: { t: Toast; onDone: () => void }) {
  // auto-dismiss after 3s
  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);

  const bg =
    t.variant === "error" ? "#fee2e2" :
    t.variant === "success" ? "#dcfce7" :
    "#e5f3ff";

  const border =
    t.variant === "error" ? "#ef4444" :
    t.variant === "success" ? "#22c55e" :
    "#3b82f6";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        padding: "10px 12px",
        borderRadius: 10,
        minWidth: 260,
        boxShadow: "0 8px 20px rgba(0,0,0,.15)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
      {t.message && (
        <div style={{ fontSize: 13, opacity: 0.85 }}>{t.message}</div>
      )}
    </div>
  );
}

export default function Toasts() {
  const { toasts, remove } = useToasts();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "grid",
        gap: 10,
        zIndex: 1000,
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} t={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  );
}
