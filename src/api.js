const BASE = import.meta.env.VITE_API_URL || 'https://aduanas-duca-api.onrender.com'

async function handle(res) {
  if (!res.ok) {
    let text = await res.text().catch(()=>'')
    throw new Error(text || res.statusText)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export async function login(email, password) {
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return handle(res)
}

export async function getUsuarios(token) {
  const res = await fetch(BASE + '/usuarios', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function crearUsuario(token, data) {
  const res = await fetch(BASE + '/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(data)
  })
  return handle(res)
}

export async function registrarDUCA(token, payload) {
  const res = await fetch(BASE + '/duca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function listarValidacionPendientes(token) {
  const res = await fetch(BASE + '/validacion/pendientes', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function aprobarDUCA(token, numero) {
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/aprobar`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function rechazarDUCA(token, numero, motivo) {
  const res = await fetch(BASE + `/validacion/${encodeURIComponent(numero)}/rechazar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ motivo })
  })
  return handle(res)
}

export async function estados(token) {
  const res = await fetch(BASE + '/estados', {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handle(res)
}

export async function detalleEstado(token, numero) {
  const res = await fetch(
    BASE + '/estados/' + encodeURIComponent(numero),
    { headers: { Authorization: 'Bearer ' + token } }
  );
  return handle(res);
}

