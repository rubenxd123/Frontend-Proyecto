import { useEffect, useState } from 'react'
import { estados, detalleEstado } from '../api'
import Modal from '../components/Modal'

export default function States({ token }) {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(false)
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setRows(await estados(token))
      } catch (e) {
        setMsg(String(e))
      }
    })()
  }, [token])

  // 🔵 Colores por estado
  const badgeClass = (s = '') => {
    switch (s.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-amber-500/10 text-amber-300 border border-amber-400'
      case 'EN_REVISION':
      case 'EN REVISIÓN':
        return 'bg-indigo-500/10 text-indigo-300 border border-indigo-400'
      case 'VALIDADA':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-400'
      case 'RECHAZADA':
        return 'bg-rose-500/10 text-rose-300 border border-rose-400'
      case 'ENVIADA':
        return 'bg-cyan-500/10 text-cyan-300 border border-cyan-400'
      default:
        return 'bg-slate-600/30 text-slate-300 border border-slate-500'
    }
  }

  // 🔍 Cargar detalle y abrir modal
  const verDetalle = async (numero) => {
    try {
      const data = await detalleEstado(token, numero) // GET /estados/:numero
      setDetalle({ numero, ...data })
    } catch (e) {
      // Si tu backend aún no tiene el endpoint, mostramos algo básico
      setDetalle({
        numero,
        mensaje: 'Detalle no disponible en la API (GET /estados/:numero).',
      })
    } finally {
      setOpen(true)
    }
  }

  return (
    <div className="container py-8">
      <div className="card">
        <h2 className="mb-2">Estados de mis declaraciones</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.numero_documento}>
                  <td>{r.numero_documento}</td>
                  <td>
                    <span className={`badge ${badgeClass(r.estado_documento)}`}>
                      {r.estado_documento}
                    </span>
                  </td>
                  <td>{new Date(r.creado_en).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => verDetalle(r.numero_documento)}
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {msg && <p className="text-red-400 text-sm mt-2">{msg}</p>}
      </div>

      {/* 🪟 Modal de detalle */}
      <Modal
        open={open}
        title={`Detalle • ${detalle?.numero || ''}`}
        onClose={() => setOpen(false)}
      >
        {!detalle ? (
          <p>Cargando…</p>
        ) : detalle.historial ? (
          <div className="space-y-3">
            <p className="text-slate-300">
              Último estado: <strong>{detalle.estado}</strong>
            </p>
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Motivo</th>
                    <th>Por</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.historial.map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.fecha).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${badgeClass(h.estado)}`}>
                          {h.estado}
                        </span>
                      </td>
                      <td>{h.motivo || '—'}</td>
                      <td>{h.usuario || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Fallback si el backend aún no expone el detalle
          <pre className="text-slate-300 whitespace-pre-wrap">
            {JSON.stringify(detalle, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  )
}
