// src/api.js
const BASE = import.meta.env.VITE_API_URL || 'https://aduanas-duca-api.onrender.com';

// Helpers mínimos y robustos
function stripHtml(s = '') {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
async function readBody(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  try { return await res.text(); } catch { return null; }
}
async function handle(res) {
  const body = await readBody(res);
  if (res.ok) return body ?? null;

  let msg = '';
  if (body && typeof body === 'object') msg = body.message || body.error || '';
  else if (typeof body === 'string') msg = stripHtml(body);
  if (!msg) msg = `${res.status} ${res.statusText}`;
  throw new Error(msg);
}

// -------- Endpoints ----------
export async function login(email, password) {
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function getUsuarios(token) {            // 👈👈 requerido por Users.jsx
  const res = await fetch(BASE + '/usuarios', {
    headers: { Authorization: 'Bearer ' + token },
  });
  return handle(res);
}

export async function crearUsuario(token, data) {
  const res = await fetch(BASE + '/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function registrarDUCA(token, payload) {
  const res = await fetch(BASE + '/duca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function listarValidacionPendientes(token) {
  const res = await fetch(BASE + '/validacion/pendientes', {
    headers: { Authorization: 'Bearer ' + token },
  });
  return handle(res);
}

export async function aprobarDUCA(token, numero) {
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/aprobar`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  });
  return handle(res);
}

export async function rechazarDUCA(token, numero, motivo) {
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/rechazar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ motivo }),
  });
  return handle(res);
}

export async function estados(token) {
  const res = await fetch(BASE + '/estados', {
    headers: { Authorization: 'Bearer ' + token },
  });
  return handle(res);
}

export async function detalleEstado(token, numero) {
  const res = await fetch(BASE + '/estados/' + encodeURIComponent(numero), {
    headers: { Authorization: 'Bearer ' + token },
  });
  return handle(res);
}
