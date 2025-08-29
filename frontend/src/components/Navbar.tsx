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
    <nav style={{ display: "flex", gap: 12 }}>
      <Link to="/">Home</Link>

      {/* Match the paths actually defined in main.tsx */}
      <Link to="/public">Public</Link>

      {email ? (
        <>
          {/* Protected “My routes” is /mine (not /routes/mine) */}
          <Link to="/mine">My routes</Link>

          <Link to="/create">Create</Link>
          <span>Hi, {email}</span>
          <button
            onClick={() => {
              removeToken();
              location.assign("/login");
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
