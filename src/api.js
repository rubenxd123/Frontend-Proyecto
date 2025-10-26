// src/api.js
// ===================== Base de API =====================
// Normalizamos para evitar dobles o faltas de "/"
export const API_BASE = (() => {
  const raw = import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";
  return raw.replace(/\/+$/, ""); // sin slash final
})();

// ===================== Helpers =====================
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

/**
 * fetchJSON: hace fetch con JSON, timeout y mensajes de error legibles
 */
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

export const getJSON = (path, options) =>
  fetchJSON(path, { ...(options || {}), method: "GET" });

export const postJSON = (path, body, options) =>
  fetchJSON(path, { ...(options || {}), method: "POST", body });

// ===================== Endpoints =====================

// ---------- AUTH ----------
export function login(email, password) {
  // Ajusta aquí si tu backend usa otra ruta (p.ej. /api/auth/login)
  return postJSON("/auth/login", { email, password });
}

// ---------- VALIDACIÓN (Admin) ----------
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

// Aliases para no romper componentes que usen otros nombres:
export const aprobarDuca = aprobarNumero;
export const rechazarDuca = rechazarNumero;

// ---------- DUCA ----------
export function getDucaByNumero(numero) {
  return getJSON(`/duca/${encodeURIComponent(numero)}`);
}
// Alias (por si algún componente lo usa con este nombre)
export const getDucaDetalle = getDucaByNumero;

// Registrar DUCA desde el formulario
export function registrarDUCA(payload) {
  // Cambia la ruta si tu backend usa un prefijo distinto (p.ej. /api/duca)
  return postJSON("/duca", payload);
}

// Estados de mis DUCA (pantalla Estados)
export function getEstados() {
  return getJSON("/duca/estados");
}

// ---------- USUARIOS (Admin) ----------
export function getUsuarios() {
  return getJSON("/usuarios");
}

export function crearUsuario(payload) {
  return postJSON("/usuarios", payload);
}
