// frontend/src/pages/PublicRoutes.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Skeleton } from "../components/Loading";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number | null;
  public: boolean;
};

export default function PublicRoutes() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page = await api.get<{ content: RouteItem[] }>("/api/routes");
        setItems(Array.isArray(page?.content) ? page.content : []);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Public routes</h2>
        <Skeleton height={48} />
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Public routes</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {!items.length ? (
        <p style={{ color: "#777" }}>(none)</p>
      ) : (
        <ul className="route-list">
          {items.map(r => (
            <li key={r.id} className="route-item">
              <div style={{ display: "grid", gap: 2 }}>
                <Link to={`/routes/${r.id}`} style={{ fontWeight: 600 }}>
                  {r.name}
                </Link>
                <div className="route-meta">
                  <span>{r.distanceMeters ?? "—"} m</span>
                  <span className="tag tag-green">public</span>
                </div>
              </div>
              <Link className="btn btn-sm" to={`/routes/${r.id}`}>Open</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
