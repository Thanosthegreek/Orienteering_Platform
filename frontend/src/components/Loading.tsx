export function Spinner({ size = 18 }: { size?: number }) {
  const s = size;
  return (
    <div
      aria-label="Loading"
      style={{
        width: s, height: s, borderRadius: "50%",
        border: "2px solid #ddd", borderTopColor: "#555",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

/** Gray shimmering block */
export function Skeleton({ height = 16, width = "100%", radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        background:
          "linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)",
        backgroundSize: "400% 100%",
        animation: "skeleton-shimmer 1.2s ease-in-out infinite",
      }}
    />
  );
}

// global CSS you can paste into index.css if you like:
/*
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes skeleton-shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
*/
