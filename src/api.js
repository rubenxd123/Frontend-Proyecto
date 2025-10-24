// src/api.js
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function fetchJSON(path, { method = "GET", headers, body, timeout = 12000 } = {}) {
  const { signal, cancel } = withTimeout(timeout);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "omit",
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    cancel();
  }
}

export function getJSON(path, options) {
  return fetchJSON(path, { ...(options || {}), method: "GET" });
}

export function postJSON(path, body, options) {
  return fetchJSON(path, { ...(options || {}), method: "POST", body });
}
