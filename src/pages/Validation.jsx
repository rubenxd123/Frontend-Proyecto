// src/pages/Validacion.jsx
import { useEffect, useState } from 'react'
import {
  listarValidacionPendientes,
  aprobarDUCA,
  rechazarDUCA,
  detalleEstado,
} from '../api'

// Formateador de fecha para mostrar de forma amigable
const dtf = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const formatFecha = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return isNaN(d) ? String(v) : dtf.format(d)
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

      {/* Modal Detalle */}
      {open && (
        <div className="modal-backdrop">
          <div className="modal max-w-4xl">
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
              <div className="space-y-6 text-base">
                <p className="text-gray-300">
                  A continuación puedes ver los datos principales de esta
                  declaración. La información está simplificada para que sea
                  fácil de leer y entender.
                </p>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="card-sub">
                    <p className="text-sm font-semibold text-gray-400">
                      Fecha de emisión
                    </p>
                    <p className="text-lg font-medium">
                      {formatFecha(detalle.duca?.fecha_emision)}
                    </p>
                  </div>
                  <div className="card-sub">
                    <p className="text-sm font-semibold text-gray-400">Moneda</p>
                    <p className="text-lg font-medium">{detalle.duca?.moneda}</p>
                  </div>
                  <div className="card-sub">
                    <p className="text-sm font-semibold text-gray-400">
                      Valor declarado
                    </p>
                    <p className="text-lg font-medium">
                      {Number(detalle.duca?.valor_aduana_total ?? 0).toLocaleString('es-GT')} Q
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Datos del Importador</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><strong>Nombre:</strong> {detalle.duca?.importador?.nombre || 'No disponible'}</li>
                      <li><strong>Documento:</strong> {detalle.duca?.importador?.documento || 'No disponible'}</li>
                      <li><strong>País:</strong> {detalle.duca?.importador?.pais || 'No disponible'}</li>
                    </ul>
                  </div>

                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Datos del Exportador</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><strong>Nombre:</strong> {detalle.duca?.exportador?.nombre || 'No disponible'}</li>
                      <li><strong>Documento:</strong> {detalle.duca?.exportador?.documento || 'No disponible'}</li>
                      <li><strong>País:</strong> {detalle.duca?.exportador?.pais || 'No disponible'}</li>
                    </ul>
                  </div>

                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Transporte Utilizado</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><strong>Medio:</strong> {detalle.duca?.transporte?.medio || 'No disponible'}</li>
                      <li><strong>Placa:</strong> {detalle.duca?.transporte?.placa || 'No disponible'}</li>
                      <li><strong>Conductor:</strong> {detalle.duca?.transporte?.conductor || 'No disponible'}</li>
                      <li><strong>Ruta:</strong> {detalle.duca?.transporte?.ruta || 'No disponible'}</li>
                    </ul>
                  </div>

                  <div className="card-sub">
                    <h4 className="text-lg font-semibold mb-2">Información General</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><strong>Número de documento:</strong> {detalle.duca?.numero_documento}</li>
                      <li><strong>País que emite:</strong> {detalle.duca?.pais_emisor}</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-400 italic">
                  Si necesitas más información o notas algún dato incorrecto,
                  contacta con la administración o el encargado de validación.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// utilidad para limpiar mensajes de error del backend
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
