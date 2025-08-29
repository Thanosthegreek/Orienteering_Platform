// frontend/src/pages/CreateRoute.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../lib/api";
import { useToast } from "../components/Toasts";
import { Spinner } from "../components/Loading";

// --- local helpers ---
type LatLng = [number, number]; // [lat, lng]

// strip optional SRID=4326; prefix
function stripSrid(wkt: string): string {
  return wkt.replace(/^SRID=\d+\s*;\s*/i, "").trim();
}

// parse "LINESTRING(x y, x y, ...)" where x=lon, y=lat -> Leaflet [lat,lng]
function parseLineString(wkt: string): LatLng[] {
  const m = wkt.match(/^LINESTRING\s*\((.+)\)$/i);
  if (!m) throw new Error("Not a LINESTRING WKT");
  return m[1]
    .split(",")
    .map(s => s.trim())
    .map(pair => {
      const [xStr, yStr] = pair.split(/\s+/);
      const lon = Number(xStr);
      const lat = Number(yStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error("Invalid coordinate in WKT");
      }
      return [lat, lon] as LatLng;
    });
}

// rough haversine distance (meters) over polyline
function lengthMeters(path: LatLng[]): number {
  if (path.length < 2) return 0;
  const R = 6371000;
  let sum = 0;
  for (let i = 1; i < path.length; i++) {
    const [lat1, lon1] = path[i - 1];
    const [lat2, lon2] = path[i];
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    sum += R * c;
  }
  return sum;
}
// ----------------------

type FieldErrors = {
  name?: string;
  distanceMeters?: string;
  geomWkt?: string;
};

export default function CreateRoute() {
  const navigate = useNavigate();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [distanceMeters, setDistanceMeters] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(true);
  const [wktInput, setWktInput] = useState("");

  const [cleanWkt, setCleanWkt] = useState("");
  const [path, setPath] = useState<LatLng[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [fieldErrs, setFieldErrs] = useState<FieldErrors>({});

  // live-parse WKT as user types
  useEffect(() => {
    const raw = (wktInput || "").trim();
    if (!raw) {
      setCleanWkt("");
      setPath([]);
      setParseError(null);
      return;
    }
    try {
      const cleaned = stripSrid(raw);
      const pts = parseLineString(cleaned);
      setCleanWkt(cleaned);
      setPath(pts);
      setParseError(null);
    } catch (e: any) {
      setCleanWkt("");
      setPath([]);
      setParseError(e?.message ?? "Invalid WKT");
    }
  }, [wktInput]);

  const estimate = useMemo(() => Math.round(lengthMeters(path)), [path]);
  const center = useMemo<LatLng | null>(() => (path.length ? path[0] : null), [path]);

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "Name is required.";
    if (parseError) e.geomWkt = parseError;
    if (!cleanWkt) e.geomWkt = e.geomWkt ?? "Provide a valid LINESTRING WKT.";
    if (distanceMeters !== "" && typeof distanceMeters === "number" && distanceMeters < 0) {
      e.distanceMeters = "Distance must be ≥ 0.";
    }
    setFieldErrs(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const dist =
      typeof distanceMeters === "number" && distanceMeters > 0
        ? distanceMeters
        : estimate > 0
        ? estimate
        : 0;

    try {
      setSaving(true);
      const body = {
        name: name.trim(),
        distanceMeters: dist,
        public: isPublic,
        geomWkt: cleanWkt, // backend expects plain LINESTRING
      };
      const res = await api.post<{ id: number }>("/api/routes", body);
      push({ variant: "success", title: "Created", message: "Route created successfully." });
      navigate(`/routes/${res.id}`);
    } catch (err: any) {
      // try to surface server field errors if present
      try {
        const obj = JSON.parse(err?.body || "{}");
        const fe: FieldErrors = {};
        if (obj?.errors?.name) fe.name = String(obj.errors.name);
        if (obj?.errors?.distanceMeters) fe.distanceMeters = String(obj.errors.distanceMeters);
        if (obj?.errors?.geomWkt) fe.geomWkt = String(obj.errors.geomWkt);
        if (Object.keys(fe).length) {
          setFieldErrs(fe);
        } else {
          push({
            variant: "error",
            title: "Create failed",
            message: String(err?.body || err?.message || "Unknown error"),
          });
        }
      } catch {
        push({
          variant: "error",
          title: "Create failed",
          message: String(err?.body || err?.message || "Unknown error"),
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h2>Create route</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 760 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>Name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Morning Loop"
            style={{ padding: 8, borderColor: fieldErrs.name ? "crimson" : undefined }}
          />
          {fieldErrs.name && <small style={{ color: "crimson" }}>{fieldErrs.name}</small>}
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "grid", gap: 4, flex: 1 }}>
            <span>Distance (m)</span>
            <input
              type="number"
              value={distanceMeters}
              onChange={e => setDistanceMeters(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={estimate ? String(estimate) : "e.g. 1200"}
              style={{ padding: 8, borderColor: fieldErrs.distanceMeters ? "crimson" : undefined }}
              min={0}
            />
            {fieldErrs.distanceMeters && (
              <small style={{ color: "crimson" }}>{fieldErrs.distanceMeters}</small>
            )}
          </label>

          <label style={{ alignSelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
            Public
          </label>
        </div>

        {path.length >= 2 && (
          <div>
            Estimated distance: <strong>{estimate} m</strong>{" "}
            <button type="button" onClick={() => setDistanceMeters(estimate)} style={{ marginLeft: 8 }}>
              Use estimate
            </button>
          </div>
        )}

        <label style={{ display: "grid", gap: 4 }}>
          <span>Geometry (WKT)</span>
          <textarea
            value={wktInput}
            onChange={e => setWktInput(e.target.value)}
            placeholder="LINESTRING(23.721 37.983, 23.723 37.985)"
            rows={5}
            style={{ padding: 8, fontFamily: "monospace", borderColor: fieldErrs.geomWkt ? "crimson" : undefined }}
          />
          {(fieldErrs.geomWkt || parseError) && (
            <small style={{ color: "crimson" }}>{fieldErrs.geomWkt || parseError}</small>
          )}
        </label>

        <button type="submit" disabled={saving}>
          {saving ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Spinner /> Creating…
            </span>
          ) : (
            "Create"
          )}
        </button>
      </form>

      {/* Map preview */}
      {center && path.length >= 2 && (
        <div style={{ height: 420 }}>
          <PreviewMap center={center} path={path} />
        </div>
      )}
    </div>
  );
}

/* ----------------- map preview ----------------- */
function PreviewMap({ center, path }: { center: LatLng; path: LatLng[] }) {
  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={path} />
      <Marker position={path[0]}><Popup>Start</Popup></Marker>
      <Marker position={path[path.length - 1]}><Popup>Finish</Popup></Marker>
      <FitBounds positions={path} />
    </MapContainer>
  );
}

function FitBounds({ positions }: { positions: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      (map as any).fitBounds(positions, { padding: [24, 24] });
    }
  }, [map, positions]);
  return null;
}
