import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";

export default function Navbar() {
  const { pathname } = useLocation();

  // Hide the global topbar on the Home route (we render a custom header inside Home)
  if (pathname === "/") return null;

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
    <nav className="topbar">
      <div className="topbar-left">
        <Link to="/" className="btn btn-ghost brand">Orienteering</Link>
      </div>

      <div className="topbar-spacer" />

      {email ? (
        <div className="topbar-right">
          <span className="muted">Hi, {email}</span>
          <button
            className="btn btn-sm"
            onClick={() => {
              removeToken();
              location.assign("/login");
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="topbar-right">
          <Link to="/login" className="btn btn-sm">Login</Link>
          <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
        </div>
      )}
    </nav>
  );
}
