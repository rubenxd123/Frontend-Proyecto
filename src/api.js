// ---- Base de la API (usa .env si lo tienes) ----
const API_BASE =
  (import.meta.env.VITE_API_URL || "https://aduanas-duca-api.onrender.com")
    .replace(/\/$/, "");

// ---- Rutas del documento ----
const R = {
  AUTH_LOGIN: "/api/auth/login",
  DUCA_ESTADOS: "/api/duca/estados",
  DUCA_VALIDACION: "/api/duca/validacion",
  DUCA_REGISTRAR: "/api/duca/registrar",
  USUARIOS: "/api/usuarios", // por si Users.jsx está activo
};

// ---- Fetch helper con manejo de errores ----
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
    // intenta leer mensaje del backend
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* texto plano o vacío */
    }
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ---- API genérica ----
export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  put: (p, body) => request(p, { method: "PUT", body }),
  del: (p) => request(p, { method: "DELETE" }),
};

// ---- EXPORTS que espera tu código ----
// (Esto arregla el error del build: Login.jsx importa { login } de "../api")
export function login({ email, password }) {
  // Si tu backend aún no tiene /api/auth/login, deja temporalmente un mock:
  // return Promise.resolve({ token: "demo", role: "user", email });
  return api.post(R.AUTH_LOGIN, { email, password });
}

// DUCA
export const getEstados = () => api.get(R.DUCA_ESTADOS);
export const getPendientes = () => api.get(R.DUCA_VALIDACION);
export const crearDuca = (payload) => api.post(R.DUCA_REGISTRAR, payload);
// Alias para mantener compatibilidad con DucaRegister.jsx
export { crearDuca as registrarDUCA };


// Usuarios (para evitar futuros errores en Users.jsx)
export const getUsuarios = () => api.get(R.USUARIOS);
export const crearUsuario = (u) => api.post(R.USUARIOS, u);
