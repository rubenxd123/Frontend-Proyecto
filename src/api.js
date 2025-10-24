// src/api.js

// Base de la API (usa .env si existe)
const API_BASE = (import.meta.env.VITE_API_URL || "https://aduanas-duca-api.onrender.com").replace(/\/$/, "");

// Rutas backend
const R = {
  AUTH_LOGIN: "/api/auth/login",
  DUCA_ESTADOS: "/api/duca/estados",
  DUCA_VALIDACION: "/api/duca/validacion",
  DUCA_REGISTRAR: "/api/duca/registrar",
  USUARIOS: "/api/usuarios", // opcional si usas Users.jsx
};

// Helper fetch
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// API genérica
export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  del: (p) => request(p, { method: "DELETE" }),
};

// ==== EXPORTS QUE USAN TUS PÁGINAS ====

// Login (para Login.jsx)
export function login({ email, password }) {
  return api.post(R.AUTH_LOGIN, { email, password });
}

// DUCA
export const getEstados = () => api.get(R.DUCA_ESTADOS);
export const getPendientes = () => api.get(R.DUCA_VALIDACION);
export const crearDuca = (payload) => api.post(R.DUCA_REGISTRAR, payload);

// Aliases para mantener compatibilidad con nombres usados en tus páginas
export const registrarDUCA = crearDuca;            // ← un solo alias (no dupliques)
export const obtenerPendientes = getPendientes;    // ← alias
export const obtenerEstados = getEstados;          // ← alias

// Usuarios (por si Users.jsx existe)
export const getUsuarios = () => api.get(R.USUARIOS);
export const crearUsuario = (u) => api.post(R.USUARIOS, u);
