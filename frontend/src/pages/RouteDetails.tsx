import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../components/Toasts";
import { Skeleton, Spinner } from "../components/Loading";
import Confirm from "../components/Confirm";

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
  const { push } = useToast();

  const [data, setData] = useState<RouteRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit state
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(true);
  const [wkt, setWkt] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // delete confirm modal
  const [askDelete, setAskDelete] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await api.get<RouteRes>(`/api/routes/${id}`);
        setData(r);
        // seed form
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
    setFormErr(null);
    if (!name.trim()) { setFormErr("Name is required."); return; }
    try {
      setSaving(true);
      const body: any = {
        name,
        distanceMeters: typeof distance === "number" ? distance : null,
        public: isPublic,
        geomWkt: wkt,
      };
      const updated = await api.put<RouteRes>(`/api/routes/${id}`, body);
      setData(updated);
      setEdit(false);
      push({ variant: "success", title: "Saved", message: "Route updated." });
    } catch (e: any) {
      const msg = e?.body || e?.message || "Update failed.";
      setFormErr(typeof msg === "string" ? msg : "Update failed.");
      push({ variant: "error", title: "Update failed", message: String(msg) });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await api.delete<void>(`/api/routes/${id}`);
      push({ variant: "success", title: "Deleted", message: `Route "${data?.name ?? id}" deleted.` });
      navigate("/routes/mine");
    } catch (e: any) {
      const msg = e?.body || e?.message || "Delete failed.";
      push({ variant: "error", title: "Delete failed", message: String(msg) });
    } finally {
      setAskDelete(false);
    }
  }

  const distanceLabel = useMemo(() => {
    if (data?.distanceMeters == null) return "—";
    return `${data.distanceMeters} m`;
  }, [data]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <Link to={canEdit ? "/routes/mine" : "/routes"}>← Back</Link>

      {loading ? (
        <>
          <Skeleton height={28} width="40%" />
          <Skeleton height={16} width="60%" />
          <Skeleton height={16} width="30%" />
          <Skeleton height={90} />
        </>
      ) : err ? (
        <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{err}</div>
      ) : data ? (
        <>
          <h2>Route — {data.name || "(unknown)"}</h2>
          <div><strong>Distance:</strong> {distanceLabel} {data.public ? "(public)" : "(private)"}</div>
          <div><strong>ID:</strong> {data.id}</div>

          <h3>Geometry (WKT)</h3>
          <pre style={{ background: "#f6f6f6", padding: 8 }}>
            {data.geomWkt ?? "(empty)"}
          </pre>

          {canEdit && !edit && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEdit(true)}>Edit</button>
              <button
                onClick={() => setAskDelete(true)}
                style={{ color: "white", background: "crimson" }}
              >
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

              {formErr && <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{formErr}</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onSave} disabled={saving}>
                  {saving ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Spinner /> Saving…</span> : "Save"}
                </button>
                <button onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Delete confirmation modal */}
          <Confirm
            open={askDelete}
            title="Delete route?"
            message={`This will permanently delete "${data.name ?? `#${data.id}`}".`}
            confirmText="Delete"
            cancelText="Cancel"
            tone="danger"
            onConfirm={confirmDelete}
            onCancel={() => setAskDelete(false)}
          />
        </>
      ) : null}
    </div>
  );
}
