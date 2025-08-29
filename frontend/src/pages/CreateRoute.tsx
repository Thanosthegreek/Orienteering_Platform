import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../lib/api";
import { useToast } from "../components/Toasts";
import { Spinner, Skeleton } from "../components/Loading";

// --- local helpers ---
type LatLng = [number, number];

function stripSrid(wkt: string): string {
  return wkt.replace(/^SRID=\d+\s*;\s*/i, "").trim();
}
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
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Invalid coordinate in WKT");
      return [lat, lon] as LatLng;
    });
}
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
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    sum += R * c;
  }
  return sum;
}

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
  const [submitting, setSubmitting] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // inline validation
    if (!name.trim()) { setParseError("Name is required."); return; }
    if (!cleanWkt) { setParseError("Please provide a valid LINESTRING WKT."); return; }

    const dist =
      typeof distanceMeters === "number" && distanceMeters > 0
        ? distanceMeters
        : estimate > 0
        ? estimate
        : 0;

    try {
      setSubmitting(true);
      const body = { name: name.trim(), distanceMeters: dist, public: isPublic, geomWkt: cleanWkt };
      const res = await api.post<{ id: number }>("/api/routes", body);
      push({ variant: "success", title: "Created", message: `Route "${name}" created.` });
      navigate(`/routes/${res.id}`);
    } catch (err: any) {
      const msg = err?.body || err?.message || "Create failed.";
      setParseError(typeof msg === "string" ? msg : "Create failed.");
      push({ variant: "error", title: "Create failed", message: String(msg) });
    } finally {
      setSubmitting(false);
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
            style={{ padding: 8 }}
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "grid", gap: 4, flex: 1 }}>
            <span>Distance (m)</span>
            <input
              type="number"
              value={distanceMeters}
              onChange={e => setDistanceMeters(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={estimate ? String(estimate) : "e.g. 1200"}
              style={{ padding: 8 }}
              min={0}
            />
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
            style={{ padding: 8, fontFamily: "monospace" }}
          />
        </label>

        {parseError && <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{parseError}</div>}

        <button type="submit" disabled={submitting || !name.trim() || !cleanWkt || !!parseError}>
          {submitting ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Spinner /> Creating…</span> : "Create"}
        </button>
      </form>

      {/* Map preview */}
      {center && path.length >= 2 ? (
        <div style={{ height: 420 }}>
          <PreviewMap center={center} path={path} />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <Skeleton height={18} width="40%" />
          <Skeleton height={220} />
        </div>
      )}
    </div>
  );
}

function PreviewMap({ center, path }: { center: [number, number]; path: [number, number][] }) {
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
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      (map as any).fitBounds(positions, { padding: [24, 24] });
    }
  }, [map, positions]);
  return null;
}
