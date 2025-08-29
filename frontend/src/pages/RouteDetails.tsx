import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../lib/api";

type RouteItem = {
  id: number;
  name: string;
  distanceMeters: number;
  isPublic?: boolean;  // tolerate both shapes
  public?: boolean;    // (backend @JsonProperty("public"))
  geomWkt?: string | null;
};

function toLatLngs(wkt?: string | null): [number, number][] | null {
  if (!wkt) return null;
  const m = wkt.trim().match(/^LINESTRING\s*\((.+)\)$/i);
  if (!m) return null;
  try {
    return m[1].split(",").map(s => {
      const [xStr, yStr] = s.trim().split(/\s+/);
      const lon = Number(xStr), lat = Number(yStr);
      return [lat, lon] as [number, number];
    });
  } catch { return null; }
}

export default function RouteDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // optimistic summary from navigation state (may not include geom)
  const seeded = (location.state as any)?.route as RouteItem | undefined;

  const [route, setRoute] = useState<RouteItem | undefined>(seeded);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        const full = await api.get<RouteItem>(`/api/routes/${id}`);
        if (!cancelled) setRoute(full);
      } catch (e: any) {
        if (!cancelled) setErr(e?.body || e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const latlngs = useMemo(() => toLatLngs(route?.geomWkt), [route?.geomWkt]);
  const isPublic = (route?.isPublic ?? route?.public) === true;

  return (
    <>
      <p><Link to="..">← Back</Link></p>

      <h1>Route — {route?.name ?? "(unknown)"}</h1>
      <p>
        <strong>Distance:</strong>{" "}
        {route?.distanceMeters != null ? `${route.distanceMeters} m` : "—"}{" "}
        {isPublic ? "(public)" : "(private)"}
      </p>
      <p><strong>ID:</strong> {id}</p>

      <h3>Geometry (WKT)</h3>
      {!route?.geomWkt ? (
        <p style={{ color: "#999" }}>(empty)</p>
      ) : (
        <code>{route.geomWkt}</code>
      )}

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {loading && <p>Loading…</p>}

      {latlngs ? (
        <div style={{ height: 420, marginTop: 12 }}>
          <MapContainer center={latlngs[0]} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={latlngs} />
            <Marker position={latlngs[0]}><Popup>Start</Popup></Marker>
            <Marker position={latlngs[latlngs.length - 1]}><Popup>Finish</Popup></Marker>
          </MapContainer>
        </div>
      ) : (
        !!route && <p style={{ color: "#999" }}>No geometry available in this response.</p>
      )}
    </>
  );
}
