// frontend/src/pages/Login.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { useToast } from "../components/Toasts";
import { Spinner } from "../components/Loading";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [fieldErrs, setFieldErrs] = useState<FieldErrors>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const from = (location.state as any)?.from || "/routes/mine";

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = "Email is required.";
    if (!password) e.password = "Password is required.";
    setFieldErrs(e);
    return Object.keys(e).length === 0;
    }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await api.post<{ token: string }>("/api/auth/login", {
        email: email.trim(),
        password,
      });
      setToken(res.token);
      push({ variant: "success", title: "Welcome back!", message: "Logged in successfully." });

      // go where user intended or fallback
      navigate(from, { replace: true });
    } catch (err: any) {
      // try to surface server-provided message
      let msg = String(err?.body || err?.message || "Login failed");
      try {
        const parsed = JSON.parse(err?.body || "{}");
        if (parsed?.error) msg = String(parsed.error);
        if (parsed?.message) msg = String(parsed.message);
      } catch {}
      setServerErr(msg);
      push({ variant: "error", title: "Login failed", message: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 420 }}>
      <h2>Sign in</h2>

      {serverErr && (
        <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{serverErr}</div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={{ borderColor: fieldErrs.email ? "crimson" : undefined }}
          />
          {fieldErrs.email && <small style={{ color: "crimson" }}>{fieldErrs.email}</small>}
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span>Password</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ flex: 1, borderColor: fieldErrs.password ? "crimson" : undefined }}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowPwd(v => !v)}
              title={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrs.password && <small style={{ color: "crimson" }}>{fieldErrs.password}</small>}
        </label>

        <div className="btn-row" style={{ marginTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Spinner /> Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
          <Link to="/routes" className="btn">Cancel</Link>
        </div>
      </form>

      <div style={{ color: "#6b7280", fontSize: ".9rem" }}>
        Don’t have an account? You can still explore <Link to="/routes">public routes</Link>.
      </div>
    </div>
  );
}
