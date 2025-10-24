// src/api.js

// Rutas del documento
export const ROUTES = {
  AUTH_LOGIN: "/api/auth/login",
  DUCA_ESTADOS: "/api/duca/estados",
  DUCA_VALIDACION: "/api/duca/validacion",
  DUCA_REGISTRAR: "/api/duca/registrar",
};

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(txt).message || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body: JSON.stringify(body) }),
};

// ← Para que el build no falle (Login.jsx importa "login")
export function login({ email, password }) {
  return api.post(ROUTES.AUTH_LOGIN, { email, password });
}

// Servicios DUCA usados por tus 3 pantallas
export const getEstados    = () => api.get(ROUTES.DUCA_ESTADOS);
export const getPendientes = () => api.get(ROUTES.DUCA_VALIDACION);
export const crearDuca     = (payload) => api.post(ROUTES.DUCA_REGISTRAR, payload);
