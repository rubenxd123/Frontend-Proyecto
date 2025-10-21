// src/api.js
const BASE = import.meta.env.VITE_API_URL || 'https://aduanas-duca-api.onrender.com'

// ------------------------------
// 🔧 Helpers
// ------------------------------
function stripHtml(s = '') {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function readBody(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  try {
    return await res.text()
  } catch {
    return null
  }
}

// ✅ Manejo centralizado de respuestas (ya no se muestra JSON)
async function handle(res) {
  const body = await readBody(res)

  if (res.ok) {
    return body ?? null
  }

  let msg = ''
  if (body && typeof body === 'object') {
    msg = body.message || body.error || ''
  } else if (typeof body === 'string') {
    msg = stripHtml(body)
  }
  if (!msg) msg = `${res.status} ${res.statusText}`

  throw new Error(msg)
}

// ------------------------------
// 🔐 Autenticación
// ------------------------------
export async function login(email, password) {
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await handle(res)

  // Guarda token si existe
  if (data?.token) {
    localStorage.setItem('token', data.token)
  }

  return data
}

export function getToken() {
  return localStorage.getItem('token')
}

export function logout() {
  localStorage.removeItem('token')
}

// ------------------------------
// 👥 Usuarios
// ------------------------------
export async function getUsuarios() {
  const token = getToken()
  const res = await fetch(BASE + '/usuarios', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function crearUsuario(data) {
  const token = getToken()
  const res = await fetch(BASE + '/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(data)
  })
  return handle(res)
}

// ------------------------------
// 📦 DUCA
// ------------------------------
export async function registrarDUCA(payload) {
  const token = getToken()
  const res = await fetch(BASE + '/duca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(payload)
  })
  return handle(res)
}

// ------------------------------
// ✅ Validación
// ------------------------------
export async function listarValidacionPendientes() {
  const token = getToken()
  const res = await fetch(BASE + '/validacion/pendientes', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function aprobarDUCA(numero) {
  const token = getToken()
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/aprobar`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function rechazarDUCA(numero, motivo) {
  const token = getToken()
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/rechazar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ motivo })
  })
  return handle(res)
}

// ------------------------------
// 📊 Estados
// ------------------------------
export async function estados() {
  const token = getToken()
  const res = await fetch(BASE + '/estados', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function detalleEstado(numero) {
  const token = getToken()
  const res = await fetch(BASE + '/estados/' + encodeURIComponent(numero), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}
