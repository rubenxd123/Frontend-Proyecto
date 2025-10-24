// src/api.js
export const API_BASE = "https://aduanas-duca-api.onrender.com";

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function fetchJSON(path, { method = "GET", body, headers, timeout = 10000 } = {}) {
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
  } catch (e) {
    if (e.name === "AbortError") throw new Error("La solicitud se tardó demasiado (timeout).");
    if ((e.message || "").includes("Failed to fetch")) {
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
    throw e;
  } finally {
    cancel();
  }
}
