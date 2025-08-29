const KEY = "token";

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    // treat "", "null", "undefined", or quoted-empty as no token
    if (!raw || raw === "null" || raw === "undefined" || raw === '""') return null;
    // if someone stored with quotes accidentally, strip them
    return raw.replace(/^"+|"+$/g, "");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    // store exactly the raw token (no JSON.stringify)
    localStorage.setItem(KEY, token);
  } catch {}
}

export function removeToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
