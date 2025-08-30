// frontend/src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";
import WeatherCard from "../components/WeatherCard";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  // Load greeting from /api/auth/me if a token exists
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

  function logout() {
    removeToken();
    location.assign("/login");
  }

  return (
    <div className="home-shell">
      {/* Orange hero header */}
      <div className="home-hero">
        <div className="home-hero-bar">
          <span className="brand">Orienteering</span>
          <div style={{ flex: 1 }} />
          {email && (
            <>
              <span>Hi, {email}</span>
              <button onClick={logout} className="btn btn-sm btn-danger">
                Logout
              </button>
            </>
          )}
        </div>

        <h1 className="home-title">Welcome to Orienteering</h1>
        <p className="home-sub">Create, explore, and share running routes.</p>

        <div className="home-cta">
          <Link to="/routes" className="btn btn-primary">Public Routes</Link>
          <Link to="/routes/mine" className="btn btn-success">My Routes</Link>
          <Link to="/create" className="btn btn-accent">Create</Link>
        </div>
      </div>

      {/* Blue / grey diagonal background content */}
      <div className="home-content">
        <div style={{ padding: 16 }}>
          <WeatherCard />
        </div>

        {/* Stamps (date + clock) pinned to bottom corners */}
        <div className="home-stamps">
          <div className="stamp-left">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <Clock className="stamp-right" />
        </div>
      </div>
    </div>
  );
}

/* Simple live clock */
function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <div className={className}>{now.toLocaleTimeString()}</div>;
}
