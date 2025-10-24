import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login({ setToken, setRole, setEmail }) {
  const [email, setE] = useState('admin@demo.com')
  const [password, setP] = useState('Admin123!')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const { token, rol } = await login(email, password)
      setToken(token); setRole(rol||''); setEmail(email)
      nav('/')
    } catch (e2) {
      setMsg(e2.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="card max-w-md mx-auto">
        <h1 className="mb-1">Iniciar sesión</h1>
        <p className="text-slate-400 text-sm mb-4">Usa tus credenciales del sistema</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Correo</label>
            <input className="input" type="email" value={email} onChange={e=>setE(e.target.value)} required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={e=>setP(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>{loading? 'Ingresando…':'Ingresar'}</button>
        </form>
        {msg && <p className="text-red-400 mt-3 text-sm">Error: {msg}</p>}
      </div>
    </div>
  )
}
