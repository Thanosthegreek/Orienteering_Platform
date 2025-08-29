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

export default function PublicRoutes() {
  const [items, setItems] = useState<RouteItem[] | null>(null); // null = loading
  const [err, setErr] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/routes");
        const list: RouteItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.content)
          ? res.content
          : [];
        setItems(list);
      } catch (e: any) {
        const msg = e?.body || e?.message || "Failed to load public routes.";
        setErr(typeof msg === "string" ? msg : "Failed to load public routes.");
        push({ variant: "error", title: "Load failed", message: String(msg) });
        setItems([]); // avoid spinner forever
      }
    })();
  }, [push]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Public routes</h2>

      {items === null ? (
        // loading skeletons
        <div style={{ display: "grid", gap: 10, maxWidth: 700 }}>
          <Skeleton height={18} width="45%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
          <Skeleton height={14} width="65%" />
          <Skeleton height={14} width="50%" />
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: "#777" }}>{err ? err : "(none yet)"}</p>
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
