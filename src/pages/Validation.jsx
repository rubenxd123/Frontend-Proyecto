import { useEffect, useState } from 'react'
import { aprobarDUCA, listarValidacionPendientes, rechazarDUCA } from '../api'

export default function Validation({ token }) {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')

  const load = async () => {
    setMsg(''); try { setRows(await listarValidacionPendientes(token)); } catch(e){ setMsg(String(e)) }
  }

  useEffect(()=>{ load() }, [])

  const approve = async (n) => { try { await aprobarDUCA(token, n); await load(); } catch(e){ setMsg(String(e)) } }
  const reject = async (n) => { const m = prompt('Motivo de rechazo'); try { await rechazarDUCA(token, n, m||''); await load(); } catch(e){ setMsg(String(e)) } }

  return (
    <div className="container py-8">
      <div className="card">
        <h2 className="mb-2">Pendientes / En revisión</h2>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Número</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.numero_documento}>
                  <td>{r.numero_documento}</td>
                  <td><span className="badge">{r.estado_documento}</span></td>
                  <td>{new Date(r.creado_en).toLocaleString()}</td>
                  <td className="space-x-2">
                    <button className="btn btn-primary" onClick={()=>approve(r.numero_documento)}>Aprobar</button>
                    <button className="btn btn-outline" onClick={()=>reject(r.numero_documento)}>Rechazar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p className="text-red-400 text-sm mt-2">{msg}</p>}
      </div>
    </div>
  )
}
