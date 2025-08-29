// WKT helpers: parse LineString, strip SRID, compute distance, convert to Leaflet

export type LatLng = { lat: number; lng: number };
export type LatLngTuple = [number, number];

const SRID_PREFIX = /^SRID=\d+;/i;

export function stripSrid(wkt: string): string {
  return wkt.replace(SRID_PREFIX, "").trim();
}

export function isLineStringWkt(wkt: string): boolean {
  const s = stripSrid(wkt);
  return /^LINESTRING\s*\(/i.test(s);
}

export function parseLineString(wkt: string): LatLng[] {
  const s = stripSrid(wkt);
  const m = s.match(/^LINESTRING\s*\((.+)\)$/i);
  if (!m) throw new Error("Invalid WKT (expecting LINESTRING)");
  const body = m[1].trim();
  if (!body) throw new Error("Empty LINESTRING");

  const parts = body.split(",").map(p => p.trim());
  const coords: LatLng[] = parts.map(p => {
    const nums = p.split(/\s+/).map(Number);
    if (nums.length < 2 || nums.some(Number.isNaN)) {
      throw new Error(`Invalid coordinate: "${p}"`);
    }
    // WKT order is X Y = lon lat
    const [lng, lat] = nums;
    return { lat, lng };
  });

  if (coords.length < 2) {
    throw new Error("LINESTRING needs at least two points");
  }
  return coords;
}

export function toLeafletLatLngs(points: LatLng[]): LatLngTuple[] {
  return points.map(p => [p.lat, p.lng]);
}

// Haversine distance (meters)
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x = Math.sin(dLat/2)**2 +
            Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function estimateDistanceMeters(points: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += haversine(points[i-1], points[i]);
  return Math.round(sum);
}
