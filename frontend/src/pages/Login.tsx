import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { useToast } from "../components/Toasts";
import { Spinner } from "../components/Loading";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nav = useNavigate();
  const location = useLocation();
  const { push } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post<{ token: string }>("/api/auth/login", { email: email.trim(), password });
      setToken(res.token);
      push({ variant: "success", title: "Welcome!", message: "Login successful." });
      const next = (location.state as any)?.from || "/routes/mine";
      nav(next, { replace: true });
    } catch (err: any) {
      const msg = err?.body || err?.message || "Login failed.";
      setError(typeof msg === "string" ? msg : "Login failed.");
      push({ variant: "error", title: "Login failed", message: String(msg) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", display: "grid", gap: 12 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>

        {error && <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</div>}

        <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
          {submitting ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Spinner /> Signing in…</span> : "Login"}
        </button>
      </form>
    </div>
  );
}
