import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setEmail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await api.get<{ email: string }>("/api/auth/me");
        if (!cancelled) setEmail(me.email);
      } catch {
        if (!cancelled) setEmail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
      <Link to="/" className="btn btn-ghost">Home</Link>
      <Link to="/routes" className="btn btn-ghost">Public</Link>

      {email ? (
        <>
          <Link to="/routes/mine" className="btn btn-ghost">My routes</Link>
          <Link to="/create" className="btn btn-ghost">Create</Link>
          <span style={{ marginLeft: "auto", color: "#6b7280" }}>Hi, {email}</span>
          <button
            className="btn"
            onClick={() => {
              removeToken();
              location.assign("/login");
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <div style={{ marginLeft: "auto" }} />
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </>
      )}
    </nav>
  );
}
