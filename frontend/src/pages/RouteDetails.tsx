import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

type RouteRes = {
  id: number;
  name: string;
  distanceMeters: number | null;
  public: boolean;
  geomWkt: string | null;
  ownerUsername?: string | null;
  canEdit?: boolean;
};

export default function RouteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RouteRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit state
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(true);
  const [wkt, setWkt] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await api.get<RouteRes>(`/api/routes/${id}`);
        setData(r);
        // seed edit form
        setName(r.name ?? "");
        setDistance(r.distanceMeters ?? "");
        setIsPublic(!!r.public);
        setWkt(r.geomWkt ?? "");
        setErr(null);
      } catch (e: any) {
        setErr(e?.body || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canEdit = !!data?.canEdit;

  async function onSave() {
    try {
      const body: any = {
        name,
        distanceMeters: typeof distance === "number" ? distance : null,
        public: isPublic,
        geomWkt: wkt,
      };
      const updated = await api.put<RouteRes>(`/api/routes/${id}`, body);
      setData(updated);
      setEdit(false);
      setErr(null);
    } catch (e: any) {
      setErr(e?.body || e?.message || "Update failed");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this route permanently?")) return;
    try {
      await api.delete<void>(`/api/routes/${id}`);
      navigate("/routes/mine");
    } catch (e: any) {
      setErr(e?.body || e?.message || "Delete failed");
    }
  }

  const distanceLabel = useMemo(() => {
    if (data?.distanceMeters == null) return "—";
    return `${data.distanceMeters} m`;
  }, [data]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <Link to={canEdit ? "/routes/mine" : "/routes"}>← Back</Link>
      <h2>Route — {data?.name || "(unknown)"}</h2>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {data && (
        <>
          <div>
            <strong>Distance:</strong> {distanceLabel} {data.public ? "(public)" : "(private)"}
          </div>
          <div><strong>ID:</strong> {data.id}</div>

          <h3>Geometry (WKT)</h3>
          <pre style={{ background: "#f6f6f6", padding: 8 }}>
            {data.geomWkt ?? "(empty)"}
          </pre>

          {canEdit && !edit && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEdit(true)}>Edit</button>
              <button onClick={onDelete} style={{ color: "white", background: "crimson" }}>
                Delete
              </button>
            </div>
          )}

          {canEdit && edit && (
            <div style={{ display: "grid", gap: 10, maxWidth: 720 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Name</span>
                <input value={name} onChange={e => setName(e.target.value)} />
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span>Distance (m)</span>
                <input
                  type="number"
                  value={distance}
                  min={0}
                  onChange={(e) => setDistance(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                Public
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span>Geometry (WKT)</span>
                <textarea rows={5} value={wkt} onChange={e => setWkt(e.target.value)} />
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onSave}>Save</button>
                <button onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
