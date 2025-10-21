import { useEffect, useState } from 'react'
import {
  listarValidacionPendientes,
  detalleEstado,
  aprobarDUCA,
  rechazarDUCA,
} from '../api'

export default function Validacion({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [open, setOpen] = useState(false)
  const [numero, setNumero] = useState('')
  const [detalle, setDetalle] = useState(null) // { numero, estado, historial[], duca:{} }
  const [intent, setIntent] = useState(null)   // 'aprobar' | 'rechazar' | null
  const [submitting, setSubmitting] = useState(false)
  const [motivo, setMotivo] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listarValidacionPendientes(token)
      setItems(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function abrirDetalle(nro, tryIntent = null) {
    setError('')
    setOpen(true)
    setNumero(nro)
    setIntent(tryIntent)
    setMotivo('')
    setDetalle(null)
    try {
      const d = await detalleEstado(token, nro)
      setDetalle(d)
    } catch (e) {
      setError(e.message)
    }
  }

  function cerrarModal() {
    if (submitting) return
    setOpen(false)
    setNumero('')
    setDetalle(null)
    setIntent(null)
    setMotivo('')
  }

  async function onAprobar() {
    if (!detalle) return
    if (!confirm(`¿Aprobar la declaración ${numero}?`)) return
    setSubmitting(true)
    try {
      await aprobarDUCA(token, numero)
      alert('Declaración aprobada correctamente.')
      cerrarModal()
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onRechazar() {
    if (!detalle) return
    if (!motivo.trim()) {
      alert('Debes ingresar un motivo de rechazo.')
      return
    }
    if (!confirm(`¿Rechazar la declaración ${numero}?`)) return
    setSubmitting(true)
    try {
      await rechazarDUCA(token, numero, motivo.trim())
      alert('Declaración rechazada.')
      cerrarModal()
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2>Pendientes / En revisión</h2>
          <button className="btn" onClick={load}>Actualizar</button>
        </div>

        {loading && <p>Cargando…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Creado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.numero_documento}>
                  <td>{r.numero_documento}</td>
                  <td>
                    <span className={`badge ${r.estado_documento === 'VALIDADA' ? 'success' : r.estado_documento === 'RECHAZADA' ? 'danger' : ''}`}>
                      {r.estado_documento}
                    </span>
                  </td>
                  <td>{r.creado_en}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-outline"
                      onClick={() => abrirDetalle(r.numero_documento, 'aprobar')}
                    >
                      Aprobar
                    </button>
                    <button
                      className="btn btn-outline danger"
                      onClick={() => abrirDetalle(r.numero_documento, 'rechazar')}
                    >
                      Rechazar
                    </button>
                    <button
                      className="btn"
                      onClick={() => abrirDetalle(r.numero_documento, null)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="4" className="text-center">No hay pendientes.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Detalle • {numero}</h3>
              <button className="btn btn-ghost" onClick={cerrarModal} disabled={submitting}>Cerrar</button>
            </div>

            {!detalle && !error && <p>Cargando detalle…</p>}
            {error && <p className="text-red-400">Error: {error}</p>}

            {detalle && (
              <>
                {/* Encabezado rápido */}
                <p className="mb-3">
                  Último estado: <b>{detalle.estado}</b>
                </p>

                {/* Declaración */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="card-sub">
                    <h4>Datos generales</h4>
                    <dl className="dl">
                      <div><dt>Número</dt><dd>{detalle.duca?.numero_documento}</dd></div>
                      <div><dt>Fecha emisión</dt><dd>{detalle.duca?.fecha_emision}</dd></div>
                      <div><dt>País emisor</dt><dd>{detalle.duca?.pais_emisor}</dd></div>
                      <div><dt>Moneda</dt><dd>{detalle.duca?.moneda}</dd></div>
                      <div><dt>Valor aduana</dt><dd>{detalle.duca?.valor_aduana_total}</dd></div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4>Transporte</h4>
                    <dl className="dl">
                      <div><dt>Medio</dt><dd>{detalle.duca?.transporte?.medio}</dd></div>
                      <div><dt>Placa</dt><dd>{detalle.duca?.transporte?.placa}</dd></div>
                      <div><dt>Conductor</dt><dd>{detalle.duca?.transporte?.conductor}</dd></div>
                      <div><dt>Ruta</dt><dd>{detalle.duca?.transporte?.ruta}</dd></div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4>Importador</h4>
                    <dl className="dl">
                      <div><dt>Nombre</dt><dd>{detalle.duca?.importador?.nombre}</dd></div>
                      <div><dt>Documento</dt><dd>{detalle.duca?.importador?.documento}</dd></div>
                      <div><dt>País</dt><dd>{detalle.duca?.importador?.pais}</dd></div>
                    </dl>
                  </div>

                  <div className="card-sub">
                    <h4>Exportador</h4>
                    <dl className="dl">
                      <div><dt>Nombre</dt><dd>{detalle.duca?.exportador?.nombre}</dd></div>
                      <div><dt>Documento</dt><dd>{detalle.duca?.exportador?.documento}</dd></div>
                      <div><dt>País</dt><dd>{detalle.duca?.exportador?.pais}</dd></div>
                    </dl>
                  </div>
                </div>

                {/* Mercancías */}
                <div className="card-sub mt-3">
                  <h4>Mercancías</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th><th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.duca?.mercancias || []).map((m, i) => (
                        <tr key={i}>
                          <td>{m.itemNo}</td>
                          <td>{m.descripcion}</td>
                          <td>{m.cantidad}</td>
                          <td>{m.unidad}</td>
                          <td>{m.valor}</td>
                        </tr>
                      ))}
                      {(!detalle.duca?.mercancias || detalle.duca.mercancias.length === 0) && (
                        <tr><td colSpan="5" className="text-center">Sin mercancías.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Historial */}
                <div className="card-sub mt-3">
                  <h4>Historial</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th><th>Estado</th><th>Motivo</th><th>Por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.historial || []).map((h, i) => (
                        <tr key={i}>
                          <td>{h.creado_en}</td>
                          <td>{h.estado}</td>
                          <td>{h.motivo || ''}</td>
                          <td>{h.usuario || ''}</td>
                        </tr>
                      ))}
                      {(!detalle.historial || detalle.historial.length === 0) && (
                        <tr><td colSpan="4" className="text-center">Sin historial.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Acciones dentro del modal */}
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={onAprobar}
                      disabled={submitting}
                    >
                      Aprobar
                    </button>

                    <button
                      className="btn danger"
                      onClick={onRechazar}
                      disabled={submitting}
                    >
                      Rechazar
                    </button>
                  </div>

                  {/* Motivo (solo necesario si rechazará) */}
                  <div>
                    <label className="label">Motivo de rechazo (obligatorio al rechazar)</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                      placeholder="Escribe el motivo si vas a rechazar…"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
