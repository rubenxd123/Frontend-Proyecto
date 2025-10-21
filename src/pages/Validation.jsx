// src/pages/Validacion.jsx
import { useEffect, useState } from 'react'
import {
  listarValidacionPendientes,
  aprobarDUCA,
  rechazarDUCA,
  detalleEstado,
} from '../api'

// Formateador de fecha legible para usuario final
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

  // listado
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // modal detalle
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Acciones desde la tabla (único lugar con aprobar/rechazar)
  const onApprove = async (num) => {
    if (!confirm(`¿Aprobar la declaración ${num}?`)) return
    setSubmitting(true)
    try {
      await aprobarDUCA(token, num)
      await load()
      // mensaje amable (usa tu toast si tienes)
      alert('Declaración aprobada')
    } catch (e) {
      alert(extraerMensaje(e?.message) || 'No se pudo aprobar')
    } finally {
      setSubmitting(false)
    }
  }

  const onReject = async (num) => {
    const motivo = prompt(`Motivo de rechazo para ${num}:`) || ''
    if (!motivo.trim()) return
    setSubmitting(true)
    try {
      await rechazarDUCA(token, num, motivo.trim())
      await load()
      alert('Declaración rechazada')
    } catch (e) {
      alert(extraerMensaje(e?.message) || 'No se pudo rechazar')
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
                        className="btn btn-ghost"
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

      {/* Modal de Detalle (solo visualización) */}
      {open && (
        <div className="modal-backdrop">
          <div className="modal max-w-5xl">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">Detalle</h3>
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
              <button
                className="btn btn-ghost"
                onClick={cerrarModal}
                disabled={submitting}
              >
                Cerrar
              </button>
            </div>

            {!detalle && !detalleError && <p>Cargando detalle…</p>}
            {detalleError && (
              <p className="text-red-400">Error: {detalleError}</p>
            )}

            {detalle && (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="card-sub">
                    <div className="text-xs uppercase opacity-70">
                      Fecha emisión
                    </div>
                    <div className="text-lg">
                      {formatFecha(detalle.duca?.fecha_emision)}
                    </div>
                  </div>
                  <div className="card-sub">
                    <div className="text-xs uppercase opacity-70">Moneda</div>
                    <div className="text-lg">{detalle.duca?.moneda}</div>
                  </div>
                  <div className="card-sub">
                    <div className="text-xs uppercase opacity-70">
                      Valor aduana
                    </div>
                    <div className="text-lg">
                      {Number(detalle.duca?.valor_aduana_total ?? 0).toLocaleString(
                        'es-GT'
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloques principales */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-sub">
                    <h4 className="mb-2 font-semibold">Importador</h4>
                    <dl className="dl">
                      <div>
                        <dt>Nombre</dt>
                        <dd>{detalle.duca?.importador?.nombre}</dd>
                      </div>
                      <div>
                        <dt>Documento</dt>
                        <dd>{detalle.duca?.importador?.documento}</dd>
                      </div>
                      <div>
                        <dt>País</dt>
                        <dd>{detalle.duca?.importador?.pais}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4 className="mb-2 font-semibold">Exportador</h4>
                    <dl className="dl">
                      <div>
                        <dt>Nombre</dt>
                        <dd>{detalle.duca?.exportador?.nombre}</dd>
                      </div>
                      <div>
                        <dt>Documento</dt>
                        <dd>{detalle.duca?.exportador?.documento}</dd>
                      </div>
                      <div>
                        <dt>País</dt>
                        <dd>{detalle.duca?.exportador?.pais}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4 className="mb-2 font-semibold">Transporte</h4>
                    <dl className="dl">
                      <div>
                        <dt>Medio</dt>
                        <dd>{detalle.duca?.transporte?.medio}</dd>
                      </div>
                      <div>
                        <dt>Placa</dt>
                        <dd>{detalle.duca?.transporte?.placa}</dd>
                      </div>
                      <div>
                        <dt>Conductor</dt>
                        <dd>{detalle.duca?.transporte?.conductor}</dd>
                      </div>
                      <div>
                        <dt>Ruta</dt>
                        <dd>{detalle.duca?.transporte?.ruta}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4 className="mb-2 font-semibold">Datos generales</h4>
                    <dl className="dl">
                      <div>
                        <dt>Número</dt>
                        <dd>{detalle.duca?.numero_documento}</dd>
                      </div>
                      <div>
                        <dt>País emisor</dt>
                        <dd>{detalle.duca?.pais_emisor}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Mercancías */}
                <div className="card-sub">
                  <h4 className="mb-2 font-semibold">Mercancías</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th className="text-right">Cantidad</th>
                        <th>Unidad</th>
                        <th className="text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.duca?.mercancias || []).map((m, i) => (
                        <tr key={i}>
                          <td>{m.itemNo}</td>
                          <td>{m.descripcion}</td>
                          <td className="text-right">{m.cantidad}</td>
                          <td>{m.unidad}</td>
                          <td className="text-right">
                            {Number(m.valor ?? 0).toLocaleString('es-GT')}
                          </td>
                        </tr>
                      ))}
                      {(!detalle.duca?.mercancias ||
                        detalle.duca.mercancias.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center opacity-70">
                            Sin mercancías.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Historial */}
                <div className="card-sub">
                  <h4 className="mb-2 font-semibold">Historial</h4>
                  <ul className="space-y-2">
                    {(detalle.historial || []).map((h, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-40 shrink-0 text-sm opacity-80">
                          {formatFecha(h.creado_en)}
                        </div>
                        <div>
                          <div className="font-medium">{h.estado}</div>
                          {h.motivo && (
                            <div className="text-sm opacity-90">
                              Motivo: {h.motivo}
                            </div>
                          )}
                          {h.usuario && (
                            <div className="text-xs opacity-70">
                              Por: {h.usuario}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {(!detalle.historial || detalle.historial.length === 0) && (
                      <li className="text-center opacity-70">Sin historial.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* -----------------------------------------------------------
   Utilidad para convertir cualquier respuesta JSON en texto amable
   (por si usas alert/tu toast). No modifica el flujo del componente.
----------------------------------------------------------- */
function extraerMensaje(raw) {
  if (!raw) return ''
  try {
    const j = JSON.parse(raw)
    if (typeof j === 'string') return j
    if (j?.message) return j.message
    if (j?.error) return j.error
  } catch (_) {
    /* no-op */
  }
  return raw
}
