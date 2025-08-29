import React from "react";

type ConfirmProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function Confirm({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          padding: 16,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#444", whiteSpace: "pre-wrap" }}>{message}</div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onCancel} style={{ padding: "8px 12px" }}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 12px",
              background: tone === "danger" ? "crimson" : "#222",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
