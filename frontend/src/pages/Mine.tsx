import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

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
        setErr(null);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="routes-wrap">
      <div className="routes-card">
        <h2 style={{ margin: 0 }}>My routes</h2>

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading…</p>
        ) : err ? (
          <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{err}</div>
        ) : !items.length ? (
          <p style={{ color: "#6b7280" }}>(none yet)</p>
        ) : (
          <ul className="routes-grid" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((r) => (
              <li key={r.id} className="route-item">
                <div style={{ display: "grid", gap: 2 }}>
                  <Link to={`/routes/${r.id}`} className="title-link">
                    {r.name}
                  </Link>
                  <div className="route-meta">
                    <span>{r.distanceMeters ?? "—"} m</span>
                    <span style={{ marginInline: 8, opacity: 0.5 }}>•</span>
                    <span className={`tag ${r.public ? "tag-green" : "tag-gray"}`}>
                      {r.public ? "public" : "private"}
                    </span>
                  </div>
                </div>

                <div className="btn-row">
                  <Link className="btn btn-blue btn-sm" to={`/routes/${r.id}`}>Open</Link>
                  <Link className="btn btn-purple btn-sm" to={`/routes/${r.id}`} state={{ edit: true }}>
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
