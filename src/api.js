const BASE = import.meta.env.VITE_API_URL || 'https://aduanas-duca-api.onrender.com'

function getToken() {
  try {
    const raw = localStorage.getItem('session')
    if (!raw) return ''
    return JSON.parse(raw)?.token || ''
  } catch { return '' }
}

function stripHtml(s=''){return String(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}

async function readBody(res){
  const ct = res.headers.get('content-type')||''
  if (ct.includes('application/json')) { try{return await res.json()}catch{return null} }
  try { return await res.text() } catch { return null }
}

async function fetchWithRetry(url, opts, tries=3, backoff=700){
  let last
  for(let i=0;i<tries;i++){
    try{ return await fetch(url, opts) }
    catch(e){ last=e; await new Promise(r=>setTimeout(r, backoff*(i+1))) }
  }
  throw last || new Error('Failed to fetch')
}

async function handle(res){
  const body = await readBody(res)
  if(res.ok) return body ?? null
  let msg = ''
  if(body && typeof body==='object') msg = body.message || body.error || ''
  else if (typeof body==='string') msg = stripHtml(body)
  if(!msg) msg = `${res.status} ${res.statusText}`
  throw new Error(msg)
}

export async function login(email,password){
  const res = await fetchWithRetry(BASE+'/auth/login',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email,password})
  })
  return handle(res)
}

export async function registrarDUCA(payload){
  const res = await fetchWithRetry(BASE+'/duca',{
    method:'POST',
    headers:{'Content-Type':'application/json', Authorization:'Bearer '+getToken()},
    body: JSON.stringify(payload)
  })
  return handle(res)
}

export async function estados(){
  const res = await fetchWithRetry(BASE+'/estados',{
    headers:{Authorization:'Bearer '+getToken()}
  })
  return handle(res)
}

export async function detalleEstado(numero){
  const res = await fetchWithRetry(BASE+'/estados/'+encodeURIComponent(numero),{
    headers:{Authorization:'Bearer '+getToken()}
  })
  return handle(res)
}
