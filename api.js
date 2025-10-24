// ==========================================
//  API CLIENTE para Frontend DUCA Aduanas
//  Compatible con todas las páginas del proyecto
//  Autor: Rubén Morán
// ==========================================

// URL base del backend (Render)
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://aduanas-duca-api.onrender.com"
).replace(/\/$/, "");

// ---- RUTAS BACKEND ----
const R = {
  AUTH_LOGIN: "/api/auth/login",
  DUCA_ESTADOS: "/api/duca/estados",
  DUCA_VALIDACION: "/api/duca/validacion",
  DUCA_REGISTRAR: "/api/duca/registrar",
  USUARIOS: "/api/usuarios"
};

// ---- FUNCIÓN GENÉRICA FETCH ----
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
      const json = await res.json();
      msg = json?.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ---- API BÁSICA ----
export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  del: (p) => request(p, { method: "DELETE" }),
};

// ==========================================
//            FUNCIONES DE AUTENTICACIÓN
// ==========================================
export function login({ email, password }) {
  return api.post(R.AUTH_LOGIN, { email, password });
}

// ==========================================
//               MÓDULO DUCA
// ==========================================

// Obtener lista de estados
export const getEstados = () => api.get(R.DUCA_ESTADOS);

// Obtener lista de pendientes por validar
export const getPendientes = () => api.get(R.DUCA_VALIDACION);

// Crear un nuevo DUCA
export const crearDuca = (payload) => api.post(R.DUCA_REGISTRAR, payload);

// ==========================================
//                USUARIOS (opcional)
// ==========================================
export const getUsuarios = () => api.get(R.USUARIOS);
export const crearUsuario = (usuario) => api.post(R.USUARIOS, usuario);

// ==========================================
//           ALIASES DE COMPATIBILIDAD
// ==========================================
// (Evita romper imports existentes en tus páginas)

export const registrarDUCA = crearDuca;              // para DucaRegister.jsx
export const obtenerPendientes = getPendientes;      // para Validation.jsx
export const obtenerEstados = getEstados;            // para páginas viejas
export const estados = getEstados;                   // para States.jsx
export const detalleEstado = (id) => api.get(`/api/duca/estados/${id}`); // para States.jsx

// ==========================================
//          FIN DEL MÓDULO API FRONTEND
// ==========================================
