import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { removeToken } from "../lib/auth";

/** ---- small helpers ---- */
function useNow(tickMs = 1000) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** ---- weather via Open-Meteo (free, no API key) ---- */
type Weather = { tempC: number; description: string } | null;
async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const j = await res.json();
  const t = Number(j?.current?.temperature_2m);
  const code = Number(j?.current?.weather_code);
  const desc = weatherCodeToText(code);
  if (Number.isFinite(t)) return { tempC: t, description: desc };
  return null;
}
function weatherCodeToText(code: number): string {
  // minimal mapping good-enough for demo
  if ([0].includes(code)) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "—";
}

/** ---- component ---- */
export default function Home() {
  const now = useNow();
  const [me, setMe] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather>(null);

  // greeting
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
    return () => { cancel = true; };
  }, []);

  // weather: use browser location if allowed; fallback to Athens coords
  useEffect(() => {
    let cancel = false;
    function go(lat: number, lon: number) {
      fetchWeather(lat, lon).then(w => { if (!cancel) setWeather(w); });
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => go(pos.coords.latitude, pos.coords.longitude),
        () => go(37.9838, 23.7275)
      );
    } else {
      go(37.9838, 23.7275);
    }
    return () => { cancel = true; };
  }, []);

  const dateText = useMemo(() => fmtDate(now), [now]);
  const timeText = useMemo(() => fmtTime(now), [now]);

  return (
    <div className="home-shell">
      {/* HERO (orange) */}
      <header className="home-hero">
        <div className="home-hero-bar">
          <Link to="/" className="btn btn-ghost brand">Orienteering</Link>
          <div className="topbar-spacer" />
          {me && <span className="muted">Hi, {me}</span>}
          <button
            className="btn btn-ghost"
            onClick={() => { removeToken(); location.assign("/login"); }}
          >
            Logout
          </button>
        </div>

        <h1 className="home-title">Happy trails ahead.</h1>
        <p className="home-sub">Build, save, and share your running or orienteering routes.</p>

        {/* Colorful CTA buttons */}
        <div className="home-cta">
          <Link className="btn btn-public" to="/routes">Public Routes</Link>
          <Link className="btn btn-mine" to="/routes/mine">My Routes</Link>
          <Link className="btn btn-create" to="/create">Create</Link>
          <Link className="btn btn-draw" to="/draw">Draw Builder</Link>
        </div>
      </header>

      {/* CONTENT (teal/gray background) */}
      <main className="home-content">
        {/* Weather */}
        <section className="card">
          <h3>Weather forecast</h3>
          <div style={{ marginTop: 6 }}>
            {weather ? (
              <>
                <div>
                  <strong>Current:</strong> {Math.round(weather.tempC)}°C — {weather.description}
                </div>
                <small className="muted">Data: Open-Meteo.com (no key required)</small>
              </>
            ) : (
              <span className="muted">Loading…</span>
            )}
          </div>
        </section>

        {/* Quick start */}
        <section className="card">
          <h3>Quick start</h3>
          <ul className="disc" style={{ marginTop: 6 }}>
            <li>
              Paste a <strong>LINESTRING WKT</strong> and preview it on the map.
              <div className="muted" style={{ marginTop: 4 }}>
                Go to <Link to="/create">Create</Link> and paste a WKT such as:
                <code style={{ marginLeft: 6 }}>LINESTRING(23.721 37.983, 23.723 37.985)</code>
              </div>
            </li>
            <li>
              See an estimated distance and save your route.
              <div className="muted">Create auto-estimates the distance from your line.</div>
            </li>
            <li>
              Keep routes private or mark them public.
              <div className="muted">Toggle the “Public” checkbox when creating or editing.</div>
            </li>
            <li>
              <strong>Public Routes</strong> button:
              <div className="muted">Browse everyone’s routes that are public.</div>
            </li>
            <li>
              <strong>My Routes</strong> button:
              <div className="muted">See, edit, or delete your own saved routes.</div>
            </li>
            <li>
              <strong>Draw Builder</strong> button:
              <div className="muted">
                Click to place points on a blank canvas, auto-compute distance, and export WKT.
              </div>
            </li>
          </ul>
        </section>

        {/* bottom stamps */}
        <div className="home-stamps">
          <div className="stamp-left">{dateText}</div>
          <div className="stamp-right">{timeText}</div>
        </div>
      </main>
    </div>
  );
}
