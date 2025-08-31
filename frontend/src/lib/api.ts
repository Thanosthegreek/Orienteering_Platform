// frontend/src/lib/api.ts
import { getToken, removeToken } from "./auth";

// Dev: leave BASE empty so Vite proxies /api → http://localhost:8080
// Prod: set VITE_API_BASE to your backend URL (e.g. https://api.example.com)
const BASE = import.meta.env.VITE_API_BASE || "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Ensure /api/auth/* path tail is lowercase */
function normalizePath(path: string): string {
  if (path.startsWith("/api/auth/")) {
    const tail = path.slice("/api/auth/".length);
    return `/api/auth/${tail.toLowerCase()}`;
  }
  return path;
}

async function request<T = any>(method: HttpMethod, path: string, body?: any): Promise<T> {
  const token = getToken();

  const normalizedPath = normalizePath(path);
  const url = `${BASE}${normalizedPath}`;

  // Debug
  console.log(`[api] method=${method} original="${path}" normalized="${normalizedPath}" url=${url}`);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let text = "";
    try {
      text = contentType.includes("application/json")
        ? JSON.stringify(await res.json())
        : await res.text();
    } catch {
      // ignore parse errors
    }

    // ✅ Only clear token on 401; do NOT auto-redirect.
    // 403 may mean "authenticated but not allowed" — do not log the user out.
    if (res.status === 401) {
      removeToken();
    }

    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export const api = {
  get:    <T = any>(path: string) => request<T>("GET", path),
  post:   <T = any>(path: string, body?: any) => request<T>("POST", path, body),
  put:    <T = any>(path: string, body?: any) => request<T>("PUT", path, body),
  patch:  <T = any>(path: string, body?: any) => request<T>("PATCH", path, body),
  delete: <T = any>(path: string) => request<T>("DELETE", path),
};
