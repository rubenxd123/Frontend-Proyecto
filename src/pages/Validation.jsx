// src/pages/Validacion.jsx
import { useEffect, useState } from 'react'
import {
  listarValidacionPendientes,
  aprobarDUCA,
  rechazarDUCA,
  detalleEstado,
} from '../api'

// ────────────────────────────────────────────────────────────
// Utilidades de formato
// ────────────────────────────────────────────────────────────
const dtf = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const nfmt = new Intl.NumberFormat('es-GT')

const formatFecha = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return isNaN(d) ? String(v) : dtf.format(d)
}
const formatQ = (v) => nfmt.format(Number(v ?? 0))

// Extraer mensaje humano de errores del backend
function extraerMensaje(raw) {
  if (!raw) return ''
  try {
    const j = JSON.parse(raw)
    if (typeof j === 'string') return j
    if (j?.message) return j.message
    if (j?.error) return j.error
  } catch (_) {}
  return raw
}

export default function Validacion({ token: tokenProp }) {
  const token = tokenProp || localStorage.getItem('token') || ''

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false)
  const [numero, setNumero] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [detalleError, setDetalleError] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await listarValidacionPendientes(token)
      setRows(Array.isArray(r) ? r : [])
    } catch (e) {
      setError(e?.message || 'No se pudo cargar la lista')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ────────────────────────────────────────────────────────────
  // Acciones
  // ────────────────────────────────────────────────────────────
  const verDetalle = async (num) => {
    setNumero(num)
    setOpen(true)
    setDetalle(null)
    setDetalleError('')
    try {
      const r = await detalleEstado(token, num)
      setDetalle(r)
    } catch (e) {
      setDetalleError(e?.message || 'No se pudo cargar el detalle')
    }
  }

  const cerrarModal = () => {
    if (submitting) return
    setOpen(false)
    setNumero('')
    setDetalle(null)
    setDetalleError('')
  }

  const onApprove = async (num) => {
    if (!confirm(`¿Deseas aprobar la declaración ${num}?`)) return
    setSubmitting(true)
    try {
      await aprobarDUCA(token, num)
      await load()
      alert('✅ Declaración aprobada con éxito.')
    } catch (e) {
      alert(extraerMensaje(e?.message) || 'No se pudo aprobar.')
    } finally {
      setSubmitting(false)
    }
  }

  const onReject = async (num) => {
    const motivo = prompt(`Por favor, indica el motivo del rechazo de ${num}:`) || ''
    if (!motivo.trim()) return
    if (!confirm(`¿Confirmas rechazar la declaración ${num}?`)) return
    setSubmitting(true)
    try {
      await rechazarDUCA(token, num, motivo.trim())
      await load()
      alert('❌ Declaración rechazada correctamente.')
    } catch (e) {
      alert(extraerMensaje(e?.message) || 'No se pudo rechazar.')
    } finally {
      setSubmitting(false)
    }
  }

  // ────────────────────────────────────────────────────────────
  // Vista
  // ────────────────────────────────────────────────────────────
  return (
    <div className="container py-8">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pendientes / En revisión</h2>
          <button className="btn btn-outline" onClick={load} disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {error && <div className="alert alert-error mb-3">{error}</div>}

        <div className="overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Creado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.numero_documento}>
                  <td className="font-mono">{r.numero_documento}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.estado_documento === 'VALIDADA'
                          ? 'success'
                          : r.estado_documento === 'RECHAZADA'
                          ? 'danger'
                          : ''
                      }`}
                    >
                      {r.estado_documento}
                    </span>
                  </td>
                  <td>{formatFecha(r.creado_en)}</td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="btn btn-primary"
                        onClick={() => onApprove(r.numero_documento)}
                        disabled={submitting}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn bg-red-600 text-white hover:bg-red-700"
                        onClick={() => onReject(r.numero_documento)}
                        disabled={submitting}
                      >
                        Rechazar
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => verDetalle(r.numero_documento)}
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center opacity-70 py-6">
                    No hay declaraciones pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal • Detalle simplificado y profesional */}
      {open && (
        <div className="modal-backdrop">
          <div className="modal max-w-5xl">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">Detalle de la Declaración</h3>
                {numero && (
                  <span className="font-mono text-sm opacity-80">{numero}</span>
                )}
                {detalle?.estado && (
                  <span
                    className={`badge ${
                      detalle.estado === 'VALIDADA'
                        ? 'success'
                        : detalle.estado === 'RECHAZADA'
                        ? 'danger'
                        : ''
                    }`}
                  >
                    {detalle.estado}
                  </span>
                )}
              </div>
              <button className="btn btn-ghost" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>

            {!detalle && !detalleError && <p>Cargando detalle…</p>}
            {detalleError && (
              <p className="text-red-400">Error: {detalleError}</p>
            )}

            {detalle && (
              <div className="space-y-6">
                {/* Encabezado con resumen clave */}
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="card-sub">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Número</p>
                    <p className="font-semibold">{detalle.duca?.numero_documento || numero}</p>
                  </div>
                  <div className="card-sub">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Fecha emisión</p>
                    <p className="font-semibold">{formatFecha(detalle.duca?.fecha_emision)}</p>
                  </div>
                  <div className="card-sub">
                    <p className="text-xs uppercase tracking-wide text-gray-400">País emisor</p>
                    <p className="font-semibold">{detalle.duca?.pais_emisor || '—'}</p>
                  </div>
                  <div className="card-sub">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Moneda</p>
                    <p className="font-semibold">{detalle.duca?.moneda || '—'}</p>
                  </div>
                </div>

                {/* Valor */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="card-sub md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Valor aduana</p>
                    <p className="text-2xl font-extrabold">
                      {formatQ(detalle.duca?.valor_aduana_total)}
                    </p>
                  </div>
                </div>

                {/* Importador / Exportador */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Importador</h4>
                    <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                      <dt className="col-span-1 text-gray-400">Nombre</dt>
                      <dd className="col-span-2 font-medium">
                        {detalle.duca?.importador?.nombre || '—'}
                      </dd>

                      <dt className="col-span-1 text-gray-400">Documento</dt>
                      <dd className="col-span-2 font-medium">
                        {detalle.duca?.importador?.documento || '—'}
                      </dd>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Exportador</h4>
                    <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
                      <dt className="col-span-1 text-gray-400">Nombre</dt>
                      <dd className="col-span-2 font-medium">
                        {detalle.duca?.exportador?.nombre || '—'}
                      </dd>

                      <dt className="col-span-1 text-gray-400">Documento</dt>
                      <dd className="col-span-2 font-medium">
                        {detalle.duca?.exportador?.documento || '—'}
                      </dd>
                    </dl>
                  </div>
                </div>

                {/* Transporte */}
                <div className="card-sub">
                  <h4 className="text-lg font-semibold mb-2">Transporte</h4>
                  <dl className="grid md:grid-cols-4 gap-x-6 gap-y-2">
                    <div>
                      <dt className="text-gray-400">Medio</dt>
                      <dd className="font-medium">{detalle.duca?.transporte?.medio || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Placa</dt>
                      <dd className="font-medium">{detalle.duca?.transporte?.placa || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Conductor</dt>
                      <dd className="font-medium">{detalle.duca?.transporte?.conductor || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Ruta</dt>
                      <dd className="font-medium">{detalle.duca?.transporte?.ruta || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  Revisa que los datos correspondan a la documentación presentada.
                  Usa los botones de <span className="font-semibold">Aprobar</span> o{' '}
                  <span className="font-semibold">Rechazar</span> en la tabla superior.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
