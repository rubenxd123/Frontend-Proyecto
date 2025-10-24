// src/api.js
// Punto base del backend (Render)
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://aduanas-duca-api.onrender.com";

/* ---------- Utilidades ---------- */
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

/* ---------- Cliente fetch JSON ---------- */
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
      // intenta leer el mensaje del backend
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

    // si no hay cuerpo, devuelve null
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

/* ---------- Endpoints de negocio ---------- */

// LOGIN: usado por src/pages/Login.jsx
// Devuelve lo que responda tu backend (p.ej. { token, role, email })
export function login(email, password) {
  return postJSON("/auth/login", { email, password });
}

// Ejemplos de helpers ya usados en la app:
// Pendientes de validación
export function getPendientes() {
  return getJSON("/validacion/pendientes");
}

// Acciones de validación (con comentario obligatorio)
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

// Detalle de una DUCA por número (para el modal o la vista de estados)
export function getDucaByNumero(numero) {
  return getJSON(`/duca/${encodeURIComponent(numero)}`);
}
