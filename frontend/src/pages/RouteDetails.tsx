// frontend/src/pages/RouteDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
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

type FieldErrors = {
  name?: string;
  distanceMeters?: string;
  geomWkt?: string;
};

export default function RouteDetails() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();

  const [data, setData] = useState<RouteRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // edit state
  const [edit, setEdit] = useState<boolean>(!!(state as any)?.edit);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(true);
  const [wkt, setWkt] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrs, setFieldErrs] = useState<FieldErrors>({});
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

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (distance !== "" && typeof distance === "number" && distance < 0) next.distanceMeters = "Distance must be ≥ 0.";
    setFieldErrs(next);
    return Object.keys(next).length === 0;
  }

  function parseServerErrors(body: string | undefined): FieldErrors | null {
    if (!body) return null;
    try {
      const obj = typeof body === "string" ? JSON.parse(body) : body;
      const src: any = obj?.errors ?? obj;
      if (src && typeof src === "object") {
        const fe: FieldErrors = {};
        if (src.name) fe.name = String(src.name);
        if (src.distanceMeters) fe.distanceMeters = String(src.distanceMeters);
        if (src.geomWkt) fe.geomWkt = String(src.geomWkt);
        return Object.keys(fe).length ? fe : null;
      }
    } catch { /* ignore */ }
    return null;
  }

  async function onSave() {
    if (!validate()) return;
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
      setFieldErrs({});
      push({ variant: "success", title: "Saved", message: "Route updated." });
    } catch (e: any) {
      const fe = parseServerErrors(e?.body);
      if (fe) {
        setFieldErrs(fe);
      } else {
        push({ variant: "error", title: "Update failed", message: String(e?.body || e?.message || "Unknown error") });
      }
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
      push({ variant: "error", title: "Delete failed", message: String(e?.body || e?.message || "Unknown error") });
    } finally {
      setAskDelete(false);
    }
  }

  async function onCopyWkt() {
    if (!data?.geomWkt) return;
    try {
      await navigator.clipboard.writeText(data.geomWkt);
      push({ variant: "success", title: "Copied", message: "Copied WKT to clipboard." });
    } catch {
      push({ variant: "error", title: "Copy failed", message: "Couldn’t access clipboard." });
    }
  }

  const distanceLabel = useMemo(() => {
    if (data?.distanceMeters == null) return "—";
    return `${data.distanceMeters} m`;
  }, [data]);

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <Link to={canEdit ? "/routes/mine" : "/routes"} className="btn btn-ghost">← Back</Link>

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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Route — {data.name || "(unknown)"}</h2>
            <span className={`tag ${data.public ? "tag-green" : "tag-gray"}`}>
              {data.public ? "public" : "private"}
            </span>
          </div>

          <div className="route-meta" style={{ marginTop: 2 }}>
            <strong>Distance:</strong> {distanceLabel}
            <span style={{ opacity: 0.5 }}>•</span>
            <strong>ID:</strong> {data.id}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <h3 style={{ margin: 0 }}>Geometry (WKT)</h3>
            {data.geomWkt && (
              <button className="btn btn-sm" onClick={onCopyWkt} title="Copy WKT">
                Copy
              </button>
            )}
          </div>
          <pre>{data.geomWkt ?? "(empty)"}</pre>

          {canEdit && !edit && (
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => setEdit(true)} disabled={loading}>Edit</button>
              <button
                className="btn btn-danger"
                onClick={() => setAskDelete(true)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          )}

          {canEdit && edit && (
            <div style={{ display: "grid", gap: 10, maxWidth: 720 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Name</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ borderColor: fieldErrs.name ? "crimson" : undefined }}
                />
                {fieldErrs.name && <small style={{ color: "crimson" }}>{fieldErrs.name}</small>}
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span>Distance (m)</span>
                <input
                  type="number"
                  value={distance}
                  min={0}
                  onChange={(e) => setDistance(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ borderColor: fieldErrs.distanceMeters ? "crimson" : undefined }}
                />
                {fieldErrs.distanceMeters && <small style={{ color: "crimson" }}>{fieldErrs.distanceMeters}</small>}
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                Public
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span>Geometry (WKT)</span>
                <textarea
                  rows={5}
                  value={wkt}
                  onChange={e => setWkt(e.target.value)}
                  style={{ borderColor: fieldErrs.geomWkt ? "crimson" : undefined }}
                />
                {fieldErrs.geomWkt && <small style={{ color: "crimson" }}>{fieldErrs.geomWkt}</small>}
              </label>

              <div className="btn-row">
                <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                  {saving ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Spinner /> Saving…
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
                <button className="btn" onClick={() => { setEdit(false); setFieldErrs({}); }}>Cancel</button>
              </div>
            </div>
          )}

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
