import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../components/Toasts";
import { Skeleton } from "../components/Loading";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number | null;
  public: boolean;
};

export default function Mine() {
  const [items, setItems] = useState<RouteItem[] | null>(null); // null = loading
  const [err, setErr] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const routes = await api.get<RouteItem[]>("/api/routes/mine");
        setItems(Array.isArray(routes) ? routes : []);
      } catch (e: any) {
        const msg = e?.body || e?.message || "Failed to load your routes.";
        setErr(typeof msg === "string" ? msg : "Failed to load your routes.");
        push({ variant: "error", title: "Load failed", message: String(msg) });
        setItems([]);
      }
    })();
  }, [push]);

  return (
    <div style={{ display: "grid", gap: 12, padding: 16 }}>
      <h2>My routes</h2>

      {items === null ? (
        // loading skeletons
        <div style={{ display: "grid", gap: 10, maxWidth: 700 }}>
          <Skeleton height={18} width="35%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="70%" />
          <Skeleton height={14} width="60%" />
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: "#777" }}>
          {err ? err : "(none yet — create your first route!)"}
        </p>
      ) : (
        <ul>
          {items.map((r) => (
            <li key={r.id}>
              <Link to={`/routes/${r.id}`}>{r.name}</Link>{" "}
              — {r.distanceMeters ?? "—"} m {r.public ? "(public)" : "(private)"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
