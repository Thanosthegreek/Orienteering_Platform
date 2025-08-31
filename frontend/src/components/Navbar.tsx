import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { removeToken } from "../lib/auth";

export default function Navbar() {
  const loc = useLocation();
  // Hide navbar on Home (we render the hero header there instead)
  const hide = loc.pathname === "/";

  const [me, setMe] = useState<string | null>(null);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await api.get<{ email: string }>("/api/auth/me");
        if (!cancel) setMe(r?.email ?? null);
      } catch {
        if (!cancel) setMe(null);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [loc.pathname]);

  if (hide) return null;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link to="/" className="btn btn-nav btn-ghost brand">
          Orienteering
        </Link>
        <Link to="/routes" className="btn btn-nav btn-public">Public</Link>
        <Link to="/routes/mine" className="btn btn-nav btn-mine">My Routes</Link>
        <Link to="/create" className="btn btn-nav btn-create">Create</Link>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-right">
        {me && <span className="muted">Hi, {me}</span>}
        <button
          className="btn btn-nav btn-ghost"
          onClick={() => {
            removeToken();
            location.assign("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
