import { useEffect, useState } from 'react'
import { estados } from '../api'

export default function States({ token }) {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    (async()=>{
      try{ setRows(await estados(token)) } catch(e){ setMsg(String(e)) }
    })()
  }, [])

  return (
    <div className="container py-8">
      <div className="card">
        <h2 className="mb-2">Estados de mis declaraciones</h2>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Número</th><th>Estado</th><th>Creado</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.numero_documento}>
                  <td>{r.numero_documento}</td>
                  <td><span className="badge">{r.estado_documento}</span></td>
                  <td>{new Date(r.creado_en).toLocaleString()}</td>
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
