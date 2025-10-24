// src/api.js
// ===================== Base de API =====================
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";

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

// Auth (ajusta la ruta si tu backend usa otra)
export function login(email, password) {
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

// DUCA
export function getDucaByNumero(numero) {
  return getJSON(`/duca/${encodeURIComponent(numero)}`);
}

// <-- NUEVO: registrar DUCA (usado en DucaRegister.jsx)
export function registrarDUCA(payload) {
  // 'payload' debe ser el objeto con los campos del formulario DUCA
  // Si tu backend espera otra ruta (p.ej. /api/duca), cámbiala aquí:
  return postJSON("/duca", payload);
}

// (Opcional) listado de estados de mis DUCA, por si el frontend lo llama
export function getEstados() {
  return getJSON("/duca/estados");
}

// Usuarios (para Users.jsx)
export function getUsuarios() {
  return getJSON("/usuarios");
}

export function crearUsuario(payload) {
  return postJSON("/usuarios", payload);
}
