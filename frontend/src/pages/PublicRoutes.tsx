import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number | null;
  public: boolean;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  // (other Spring Page fields omitted)
};

export default function PublicRoutes() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Read the Page object and use .content
        const page = await api.get<Page<RouteItem>>("/api/routes?page=0&size=100");
        const list = Array.isArray((page as any)?.content) ? (page as any).content as RouteItem[] : [];
        setItems(list);
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
        <h2 style={{ margin: 0 }}>Public routes</h2>

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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
