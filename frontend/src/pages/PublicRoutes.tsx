import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number;
  public: boolean;
};

export default function PublicRoutes() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // your backend returns a Page<RouteRes> for /api/routes
        const page = await api.get<{ content?: RouteItem[] }>("/api/routes");
        setItems(Array.isArray(page?.content) ? page.content : []);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Public routes</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {!items.length ? (
        <p style={{ color: "#777" }}>(none)</p>
      ) : (
        <ul>
          {items.map(r => (
            <li key={r.id}>
              <Link to={`/routes/${r.id}`}>{r.name}</Link>{" "}
              — {r.distanceMeters} m {r.public ? "(public)" : "(private)"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
