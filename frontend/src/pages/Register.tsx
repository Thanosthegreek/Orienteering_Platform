// frontend/src/pages/Register.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { useToasts } from "../components/ToastContext";
import { Spinner } from "../components/Loading";

type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToasts();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [saving, setSaving] = useState(false);
  const [fieldErrs, setFieldErrs] = useState<FieldErrors>({});
  const [serverErr, setServerErr] = useState<string | null>(null);

  // Where to go after successful register (if they landed here from a protected page)
  const from = (location.state as any)?.from || "/routes/mine";

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = "Email is required.";
    if (!password) e.password = "Password is required.";
    if (password && password.length < 6) e.password = "At least 6 characters.";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    setFieldErrs(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    if (!validate()) return;

    try {
      setSaving(true);
      // Backend expects: { email, password } (adjust if your DTO has different fields)
      // Auth endpoints in api.ts are lowercased automatically (/api/auth/register)
      const res = await api.post<{ token: string }>("/api/auth/register", {
        email: email.trim(),
        password,
      });

      // If your backend returns a token on register, store it and log them in.
      // If it returns something else (e.g., {id,email}), remove setToken and redirect to /login.
      if (res?.token) {
        setToken(res.token);
        push({ variant: "success", title: "Welcome!", message: "Account created. You are now signed in." });
        navigate(from, { replace: true });
      } else {
        push({ variant: "success", title: "Account created", message: "Please sign in." });
        navigate("/login", { replace: true, state: { from } });
      }
    } catch (err: any) {
      let msg = String(err?.body || err?.message || "Registration failed");
      try {
        const parsed = JSON.parse(err?.body || "{}");
        if (parsed?.error) msg = String(parsed.error);
        if (parsed?.message) msg = String(parsed.message);
      } catch {}
      setServerErr(msg);
      push({ variant: "error", title: "Registration failed", message: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 16, maxWidth: 480 }}>
      <h2>Create your account</h2>

      {serverErr && <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{serverErr}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ flex: 1, borderColor: fieldErrs.password ? "crimson" : undefined }}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrs.password && <small style={{ color: "crimson" }}>{fieldErrs.password}</small>}
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          <span>Confirm password</span>
          <input
            type={showPwd ? "text" : "password"}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            style={{ borderColor: fieldErrs.confirm ? "crimson" : undefined }}
          />
          {fieldErrs.confirm && <small style={{ color: "crimson" }}>{fieldErrs.confirm}</small>}
        </label>

        <div className="btn-row" style={{ marginTop: 6 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Spinner /> Creating…
              </span>
            ) : (
              "Create account"
            )}
          </button>
          <Link to="/login" className="btn">Already have an account?</Link>
        </div>
      </form>

      <div style={{ color: "#6b7280", fontSize: ".9rem" }}>
        Or continue exploring <Link to="/routes">public routes</Link>.
      </div>
    </div>
  );
}
