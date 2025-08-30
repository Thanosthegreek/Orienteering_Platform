import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getToken, removeToken } from "../lib/auth";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // fetch email for greeting in the hero header
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
    return () => { cancelled = true; };
  }, []);

  // clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  const timeStr = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <div className="home-shell">
      {/* Full-width orange header */}
      <header className="home-hero">
        <div className="home-hero-bar">
          <Link to="/" className="btn btn-ghost brand big">Orienteering</Link>
          <div className="spacer" />
          {email ? (
            <div className="hero-right">
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
            <div className="hero-right">
              <Link to="/login" className="btn btn-sm">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
            </div>
          )}
        </div>

        <h1 className="home-title">Welcome to Orienteering</h1>
        <p className="home-sub">Create, explore, and share running routes.</p>

        <div className="home-cta">
          <Link to="/routes" className="btn btn-lg btn-primary">Public Routes</Link>
          <Link to="/routes/mine" className="btn btn-lg">My Routes</Link>
          <Link to="/create" className="btn btn-lg btn-success">Create</Link>
        </div>
      </header>

      {/* Full-width content with diagonal + bold frame */}
      <main className="home-content">
        <section className="card card-tight">
          <h3>Weather forecast</h3>
          <p className="muted">(Weather analysis / predictions will appear here…)</p>
        </section>

        <section className="card card-tight">
          <h3>Quick start</h3>
          <ul className="disc">
            <li>Paste a <strong>LINESTRING WKT</strong> and preview it on the map.</li>
            <li>See an estimated distance and save your route.</li>
            <li>Keep routes private or mark them public.</li>
          </ul>
        </section>

        <div className="home-stamps">
          <div className="stamp-left">{dateStr}</div>
          <div className="stamp-right">{timeStr}</div>
        </div>
      </main>
    </div>
  );
}
