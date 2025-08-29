import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number;
  public: boolean;
};

export default function Mine() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const routes = await api.get<RouteItem[]>("/api/routes/mine");
        setItems(Array.isArray(routes) ? routes : []);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>My routes</h2>
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
