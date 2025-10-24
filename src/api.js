// src/api.js
const API_URL = "https://aduanas-duca-api.onrender.com/api/duca"; // ✅ cambia si usas otro nombre de servicio

// Manejo global de errores
async function request(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    throw err;
  }
}

// ✅ Registrar nueva DUCA
export async function registrarDUCA(data) {
  return request(`${API_URL}/registrar`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ✅ Obtener estados de DUCA
export async function obtenerEstados() {
  return request(`${API_URL}/estados`);
}

// ✅ Obtener DUCA pendientes / en revisión
export async function obtenerPendientes() {
  return request(`${API_URL}/validacion`);
}
