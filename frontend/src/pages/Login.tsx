import { useState } from "react";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("hiker2501@example.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      // Expect { token, email?, role? }
      const res = await api.post<{ token: string; email?: string; role?: string }>(
        "/api/auth/login",
        { email, password }
      );
      if (!res?.token) throw new Error("No token in response");
      setToken(res.token);
      navigate("/"); // go home (or wherever)
    } catch (e: any) {
      setErr(e?.body || e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <p><Link to="/">Home</Link> · <Link to="/routes">Public</Link></p>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      {err && <p style={{ color: "crimson", marginTop: 8 }}>{err}</p>}
    </div>
  );
}
