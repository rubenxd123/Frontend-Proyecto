import { useEffect, useState } from 'react'
import { estados, detalleEstado } from '../api'

export default function EstadosPage({ token }) {
  token = token || localStorage.getItem('token') || ''

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalErr, setModalErr] = useState('')
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setErr('')
        const data = await estados(token)
        setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        setErr(String(e.message || e))
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  async function verDetalle(numero) {
    setModalOpen(true)
    setModalLoading(true)
    setModalErr('')
    setDetalle(null)
    try {
      const data = await detalleEstado(token, numero)
      setDetalle(data)
    } catch (e) {
      setModalErr(String(e.message || e))
    } finally {
      setModalLoading(false)
    }
  }

  const badge = (estado) => {
    const s = String(estado || '').toUpperCase()
    const cls =
      s === 'VALIDADA'
        ? 'px-2 py-1 text-xs rounded bg-green-700/30 text-green-300'
        : s === 'RECHAZADA'
        ? 'px-2 py-1 text-xs rounded bg-red-700/30 text-red-300'
        : 'px-2 py-1 text-xs rounded bg-yellow-700/30 text-yellow-200'
    return <span className={cls}>{s || 'DESCONOCIDO'}</span>
  }

  return (
    <div className="container py-8">
      <div className="card">
        <h2 className="mb-4">Estados de mis declaraciones</h2>

        {loading && <p>Cargando…</p>}
        {err && <p className="text-red-400">Error: {err}</p>}

        {!loading && !err && (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Número</th>
                <th className="text-left">Estado</th>
                <th className="text-left">Creado</th>
                <th className="text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4}>Sin registros.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.numero_documento}>
                  <td>{r.numero_documento}</td>
                  <td>{badge(r.estado_documento)}</td>
                  <td>{r.creado_en ? new Date(r.creado_en).toLocaleString() : ''}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm"
                            onClick={() => verDetalle(r.numero_documento)}>
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Detalle • {detalle?.numero || ''}</h3>
              <button className="btn" onClick={() => setModalOpen(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              {modalLoading && <p>Cargando…</p>}
              {modalErr && <p className="text-red-400">Error: {modalErr}</p>}

              {!modalLoading && !modalErr && detalle && (
                <>
                  <h4 className="font-semibold mb-2">Resumen DUCA</h4>
                  {detalle.duca ? (
                    <ul className="text-sm space-y-1">
                      <li><b>Número:</b> {detalle.duca.numero_documento}</li>
                      <li><b>Fecha emisión:</b> {detalle.duca.fecha_emision ? new Date(detalle.duca.fecha_emision).toLocaleDateString() : ''}</li>
                      <li><b>País emisor:</b> {detalle.duca.pais_emisor}</li>
                      <li><b>Moneda:</b> {detalle.duca.moneda}</li>
                      <li><b>Valor aduana:</b> {detalle.duca.valor_aduana_total}</li>
                      <li><b>Importador:</b> {detalle.duca.importador?.nombre || '-'}</li>
                      <li><b>Exportador:</b> {detalle.duca.exportador?.nombre || '-'}</li>
                      <li><b>Transporte:</b> {detalle.duca.transporte?.medio || '-'} {detalle.duca.transporte?.placa ? `(${detalle.duca.transporte.placa})` : ''}</li>
                    </ul>
                  ) : (
                    <p className="opacity-70">No se encontró la declaración.</p>
                  )}

                  <h4 className="font-semibold mt-4 mb-2">Historial</h4>
                  {Array.isArray(detalle.historial) && detalle.historial.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {detalle.historial.map((h, i) => (
                        <li key={i}>
                          {badge(h.estado)} · {h.creado_en ? new Date(h.creado_en).toLocaleString() : ''} {h.motivo ? `· ${h.motivo}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="opacity-70">Sin movimientos registrados.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
