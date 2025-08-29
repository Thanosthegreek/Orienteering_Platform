// frontend/src/lib/geo.ts
export type LatLng = [number, number];

export function stripSrid(input: string): string {
  return (input || "").replace(/^SRID=\d+;/i, "");
}

// Accepts "LINESTRING(...)" and returns Leaflet-style [lat, lng] pairs
export function parseLineString(wkt: string): LatLng[] {
  const m = wkt.match(/^LINESTRING\s*\((.+)\)$/i);
  if (!m) throw new Error("Not a LINESTRING WKT");
  return m[1]
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map(Number))
    .map(([x, y]) => {
      if (Number.isNaN(x) || Number.isNaN(y)) throw new Error("Bad coordinate");
      return [y, x] as LatLng; // Leaflet expects [lat, lon]
    });
}

// Great-circle distance in meters between two [lat, lon] points
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLengthMeters(path: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < path.length; i++) sum += haversineMeters(path[i - 1], path[i]);
  return sum;
}
