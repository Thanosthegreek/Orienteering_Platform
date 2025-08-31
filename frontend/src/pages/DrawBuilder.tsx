import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/** Simple haversine */
function meters(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const [lat1, lon1] = a, [lat2, lon2] = b;
  const dLat = (lat2-lat1) * Math.PI/180, dLon = (lon2-lon1) * Math.PI/180;
  const s1 = Math.sin(dLat/2), s2 = Math.sin(dLon/2);
  const c = s1*s1 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*s2*s2;
  return 2*R*Math.asin(Math.sqrt(c));
}

export default function DrawBuilder() {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<[number, number][][]>([[]]);
  const [hIndex, setHIndex] = useState(0);

  function pushHistory(next: [number, number][]) {
    const trimmed = history.slice(0, hIndex + 1);
    const newHist = [...trimmed, next];
    setHistory(newHist);
    setHIndex(newHist.length - 1);
  }

  const length = useMemo(() => {
    if (points.length < 2) return 0;
    let sum = 0;
    for (let i=1; i<points.length; i++) sum += meters(points[i-1], points[i]);
    return Math.round(sum);
  }, [points]);

  function undo() {
    if (hIndex === 0) return;
    const nextIndex = hIndex - 1;
    setHIndex(nextIndex);
    setPoints(history[nextIndex]);
  }
  function redo() {
    if (hIndex >= history.length - 1) return;
    const nextIndex = hIndex + 1;
    setHIndex(nextIndex);
    setPoints(history[nextIndex]);
  }
  function clearAll() {
    setPoints([]);
    pushHistory([]);
  }

  function toWkt() {
    if (points.length < 2) return "LINESTRING()";
    const line = points.map(([lat, lon]) => `${lon} ${lat}`).join(", ");
    return `LINESTRING(${line})`;
  }

  const center: [number, number] = points[0] ?? [37.9838, 23.7275];

  function ClickToAdd() {
    useMapEvents({
      click(e) {
        const p: [number, number] = [e.latlng.lat, e.latlng.lng];
        const next = [...points, p];
        setPoints(next);
        pushHistory(next);
      }
    });
    return null;
  }

  return (
    <div className="page" style={{ display: "grid", gap: 12 }}>
      {/* NEW Back button */}
      <div className="btn-row">
        <Link to="/routes/mine" className="btn btn-ghost">← Back to My Routes</Link>
      </div>

      <h2>Draw builder</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Click the map to place points. Distance is computed automatically. Export as WKT.
      </p>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 360px" }}>
        <div style={{ height: 460, background: "#eee", border: "2px solid #111", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 0 rgba(0,0,0,.15)" }}>
          <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickToAdd />
            {points.length >= 2 && <Polyline positions={points} />}
            {points.map((p, i) => <Marker key={i} position={p} />)}
          </MapContainer>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div className="card" style={{ borderRadius: 12 }}>
            <div><strong>Distance:</strong> {length} m</div>
          </div>

          <div className="card" style={{ borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>WKT</div>
            <textarea
              readOnly
              value={toWkt()}
              rows={6}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
            <div className="btn-row" style={{ marginTop: 8 }}>
              <button
                className="btn"
                onClick={() => { navigator.clipboard.writeText(toWkt()).catch(() => {}); }}
              >
                Copy WKT
              </button>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" onClick={undo} disabled={hIndex === 0}>Undo</button>
            <button className="btn" onClick={redo} disabled={hIndex === history.length - 1}>Redo</button>
            <button className="btn btn-danger" onClick={clearAll} disabled={!points.length}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
