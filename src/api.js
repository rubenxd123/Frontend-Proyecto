// src/api.js
const BASE = import.meta.env.VITE_API_URL || 'https://aduanas-duca-api.onrender.com'

function getToken() {
  try {
    const raw = localStorage.getItem('session')
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return parsed?.token || ''
  } catch {
    return ''
  }
}

// Quita HTML si el backend devolvió una página de error
function stripHtml(s = '') {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function readBody(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return await res.json() } catch { return null }
  }
  try { return await res.text() } catch { return null }
}

async function fetchWithRetry(url, opts, tries = 3, backoff = 700) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, opts)
    } catch (e) {
      lastErr = e
      await new Promise(r => setTimeout(r, backoff * (i + 1)))
    }
  }
  throw lastErr || new Error('Failed to fetch')
}

async function handle(res) {
  const body = await readBody(res)
  if (res.ok) return body ?? null

  let msg = ''
  if (body && typeof body === 'object') {
    msg = body.message || body.error || ''
  } else if (typeof body === 'string') {
    msg = stripHtml(body)
  }
  if (!msg) msg = `${res.status} ${res.statusText}`
  throw new Error(msg)
}

// ============ ENDPOINTS ============
export async function login(email, password) {
  const res = await fetchWithRetry(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return handle(res)
}

export async function registrarDUCA(payload) {
  const res = await fetchWithRetry(BASE + '/duca', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function estados() {
  const res = await fetchWithRetry(BASE + '/estados', {
    headers: { Authorization: 'Bearer ' + getToken() }
  })
  return handle(res)
}

export async function detalleEstado(numero) {
  const res = await fetchWithRetry(BASE + '/estados/' + encodeURIComponent(numero), {
    headers: { Authorization: 'Bearer ' + getToken() }
  })
  return handle(res)
}

export async function listarValidacionPendientes() {
  const res = await fetchWithRetry(BASE + '/validacion/pendientes', {
    headers: { Authorization: 'Bearer ' + getToken() }
  })
  return handle(res)
}

export async function aprobarDUCA(numero) {
  const res = await fetchWithRetry(BASE + `/validacion/${encodeURIComponent(numero)}/aprobar`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + getToken() }
  })
  return handle(res)
}

export async function rechazarDUCA(numero, motivo) {
  const res = await fetchWithRetry(BASE + `/validacion/${encodeURIComponent(numero)}/rechazar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({ motivo })
  })
  return handle(res)
}
