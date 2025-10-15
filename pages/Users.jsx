import { useEffect, useState } from 'react'
import { crearUsuario, getUsuarios } from '../api'

export default function Users({ token }) {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nombre:'', correo:'', password:'', rol:'TRANSPORTISTA' })

  const load = async () => {
    setMsg(''); try { setRows(await getUsuarios(token)); } catch(e){ setMsg(String(e)) }
  }
  useEffect(()=>{ load() }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setMsg(''); try {
      await crearUsuario(token, form)
      setForm({ nombre:'', correo:'', password:'', rol:'TRANSPORTISTA' })
      await load()
    } catch(e){ setMsg(String(e)) }
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="card">
        <h2 className="mb-2">Usuarios</h2>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Activo</th></tr></thead>
            <tbody>
              {rows.map(u=>(
                <tr key={u.id}>
                  <td>{u.nombre}</td><td>{u.correo}</td><td><span className="badge">{u.rol}</span></td><td>{u.activo? 'Sí':'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p className="text-red-400 text-sm mt-2">{msg}</p>}
      </div>

      <div className="card">
        <h2 className="mb-2">Crear usuario</h2>
        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3">
          <div><label className="label">Nombre</label><input className="input" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} required /></div>
          <div><label className="label">Correo</label><input className="input" type="email" value={form.correo} onChange={e=>setForm({...form, correo:e.target.value})} required /></div>
          <div><label className="label">Password</label><input className="input" type="text" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required /></div>
          <div>
            <label className="label">Rol</label>
            <select className="input" value={form.rol} onChange={e=>setForm({...form, rol:e.target.value})}>
              <option>TRANSPORTISTA</option>
              <option>AGENTE</option>
              <option>ADMIN</option>
            </select>
          </div>
          <div className="md:col-span-4"><button className="btn btn-primary">Crear</button></div>
        </form>
      </div>
    </div>
  )
}
