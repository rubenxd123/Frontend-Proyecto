// src/api.js
// Punto base del backend (Render)
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";

/* ===================== Helpers ===================== */
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

/* ===================== Cliente JSON ===================== */
export async function fetchJSON(
  path,
  { method = "GET", headers, body, timeout = 12000 } = {}
) {
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
        else if (typeof data === "string") msg = data;
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

export function getJSON(path, options) {
  return fetchJSON(path, { ...(options || {}), method: "GET" });
}

export function postJSON(path, body, options) {
  return fetchJSON(path, { ...(options || {}), method: "POST", body });
}

/* ===================== Endpoints ===================== */

// Auth
export function login(email, password) {
  // Ajusta la ruta si tu backend usa otra (p.ej. /auth o /usuarios/login)
  return postJSON("/auth/login", { email, password });
}

// Validación
export function getPendientes() {
  return getJSON("/validacion/pendientes");
}

export function aprobarNumero(numero, comentario) {
  return postJSON(`/validacion/${encodeURIComponent(numero)}/aprobar`, {
    comentario,
  });
}

export function rechazarNumero(numero, comentario) {
  return postJSON(`/validacion/${encodeURIComponent(numero)}/rechazar`, {
    comentario,
  });
}

// DUCA detalle por número
export function getDucaByNumero(numero) {
  return getJSON(`/duca/${encodeURIComponent(numero)}`);
}

// Usuarios (para src/pages/Users.jsx)
export function getUsuarios() {
  // Ajusta la ruta si tu backend lista usuarios en otra URL
  return getJSON("/usuarios");
}

export function crearUsuario(payload) {
  // payload esperado p.ej.: { nombre, email, password, rol }
  return postJSON("/usuarios", payload);
}
