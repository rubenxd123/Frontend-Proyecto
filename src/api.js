// src/api.js
export const API_BASE = (() => {
  const raw = import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";
  return raw.replace(/\/+$/, "");
})();

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

function authHeader() {
  try {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function fetchJSON(path, { method = "GET", headers, body, timeout = 12000 } = {}) {
  const { signal, cancel } = withTimeout(timeout);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "omit",
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
        else if (data?.error) msg = data.error;
      } catch {
        const text = await res.text().catch(() => "");
        if (text) msg = text;
      }
      throw new Error(msg);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return await res.json();
  } finally {
    cancel();
  }
}

export const getJSON = (path, options) =>
  fetchJSON(path, { ...(options || {}), method: "GET" });
export const postJSON = (path, body, options) =>
  fetchJSON(path, { ...(options || {}), method: "POST", body });
export const patchJSON = (path, body, options) =>
  fetchJSON(path, { ...(options || {}), method: "PATCH", body });

// ---------- AUTH ----------
export function login(email, password) {
  return postJSON("/auth/login", { email, password });
}

// ---------- VALIDACIÓN ----------
export function getPendientes() {
  return getJSON("/validacion/pendientes");
}
export function aprobarNumero(numero, comentario) {
  return postJSON(`/validacion/${encodeURIComponent(numero)}/aprobar`, { comentario });
}
export function rechazarNumero(numero, comentario) {
  return postJSON(`/validacion/${encodeURIComponent(numero)}/rechazar`, { comentario });
}

// ---------- DUCA ----------
export function getDucaByNumero(numero) {
  return getJSON(`/duca/${encodeURIComponent(numero)}`);
}
export function registrarDUCA(payload) {
  return postJSON("/duca", payload);
}
export function getEstados() {
  return getJSON("/duca/estados");
}

// ---------- USUARIOS ----------
export function getUsuarios() {
  return getJSON("/usuarios");
}
export function crearUsuario(payload) {
  return postJSON("/usuarios", payload);
}
export function setUsuarioActivo(id, activo) {
  return patchJSON(`/usuarios/${id}/activo`, { activo });
}
