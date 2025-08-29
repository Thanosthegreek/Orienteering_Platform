// frontend/src/pages/Mine.tsx
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

export default function Mine() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const routes = await api.get<RouteItem[]>("/api/routes/mine");
        setItems(Array.isArray(routes) ? routes : []);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>My routes</h2>
      {loading ? (
        <>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </>
      ) : err ? (
        <div style={{ color: "crimson" }}>{err}</div>
      ) : !items.length ? (
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
                  <span className={`tag ${r.public ? "tag-green" : "tag-gray"}`}>
                    {r.public ? "public" : "private"}
                  </span>
                </div>
              </div>
              <div className="btn-row">
                <Link className="btn btn-sm" to={`/routes/${r.id}`}>Open</Link>
                <Link className="btn btn-sm" to={`/routes/${r.id}`} state={{ edit: true }}>
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
