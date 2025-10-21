// src/pages/Validacion.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  listarValidacionPendientes,
  aprobarDUCA,
  rechazarDUCA,
  detalleEstado,
} from '../api'

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  const fecha = new Intl.DateTimeFormat('es-GT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d)
  const hora = new Intl.DateTimeFormat('es-GT', {
    hour: 'numeric', minute: '2-digit',
  }).format(d)
  return `${fecha}, ${hora}`
}

const fmtMoney = (n) =>
  (n ?? n === 0)
    ? new Intl.NumberFormat('es-GT', { minimumFractionDigits: 0 }).format(n)
    : '—'

const Pill = ({ children, color = 'slate' }) => {
  const COLORS = {
    slate:
      'bg-slate-800/40 text-slate-200 border border-slate-600/40',
    green:
      'bg-emerald-600/15 text-emerald-300 border border-emerald-600/30',
    red:
      'bg-rose-600/15 text-rose-300 border border-rose-600/30',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${COLORS[color]}`}>
      {children}
    </span>
  )
}

export default function Validacion({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyRow, setBusyRow] = useState('')
  const [detail, setDetail] = useState(null) // {numero, estado, duca:{...}}
  const [refreshKey, setRefreshKey] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const data = await listarValidacionPendientes(token)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      alert('No se pudo cargar la lista de pendientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey]) // re-carga al actualizar

  const onVer = async (numero) => {
    try {
      const d = await detalleEstado(token, numero)
      setDetail(d) // {numero, estado, historial, duca}
      // hacemos scroll suave al panel de detalle
      setTimeout(() => {
        document.getElementById('detalle-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    } catch (e) {
      console.error(e)
      alert('No se pudo obtener el detalle.')
    }
  }

  const onAccion = async (tipo, numero) => {
    if (busyRow) return
    const confirmMsg = tipo === 'aprobar'
      ? `¿Aprobar la DUCA ${numero}?`
      : `¿Rechazar la DUCA ${numero}?`
    if (!confirm(confirmMsg)) return

    try {
      setBusyRow(numero)
      if (tipo === 'aprobar') await aprobarDUCA(token, numero)
      else await rechazarDUCA(token, numero, 'Rechazado por revisión')
      // si el detalle abierto corresponde a este número, lo limpiamos
      if (detail?.numero === numero) setDetail(null)
      setRefreshKey(k => k + 1)
    } catch (e) {
      console.error(e)
      alert(`No fue posible ${tipo} la DUCA.`)
    } finally {
      setBusyRow('')
    }
  }

  const rows = useMemo(() => items, [items])

  const D = detail?.duca || null
  const ultimoEstado = detail?.estado || 'DESCONOCIDO'

  return (
    <div className="container mx-auto px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Pendientes / En revisión</h1>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm"
          disabled={loading}
          title="Volver a cargar"
        >
          Actualizar
        </button>
      </div>

      <div className="rounded-lg border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
              <th>Número</th>
              <th>Estado</th>
              <th>Creado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {loading && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">Cargando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">No hay pendientes.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.numero_documento} className="hover:bg-slate-800/30">
                <td className="px-3 py-2 text-slate-100 font-medium">{r.numero_documento}</td>
                <td className="px-3 py-2"><Pill color="slate">{r.estado_documento || 'PENDIENTE'}</Pill></td>
                <td className="px-3 py-2 text-slate-300">{fmtDate(r.creado_en)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      className={`px-3 py-1.5 rounded text-sm text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50`}
                      onClick={() => onAccion('aprobar', r.numero_documento)}
                      disabled={busyRow === r.numero_documento}
                    >
                      Aprobar
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded text-sm text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50`}
                      onClick={() => onAccion('rechazar', r.numero_documento)}
                      disabled={busyRow === r.numero_documento}
                    >
                      Rechazar
                    </button>
                    <button
                      className="px-3 py-1.5 rounded text-sm bg-slate-700 hover:bg-slate-600 text-slate-100"
                      onClick={() => onVer(r.numero_documento)}
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalle */}
      {detail && (
        <div id="detalle-panel" className="mt-6 rounded-lg border border-slate-700/60 p-5 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Detalle de la Declaración
            </h2>
            <span className="text-slate-400 text-sm">{detail.numero}</span>
            <Pill color={ultimoEstado === 'VALIDADA' ? 'green' : 'slate'}>
              {ultimoEstado}
            </Pill>
            <div className="ml-auto">
              <button
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm"
                onClick={() => setDetail(null)}
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Encabezado compacto */}
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-slate-400 text-xs">Número</div>
              <div className="text-slate-100 font-medium">{D?.numero_documento || detail?.numero || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Fecha emisión</div>
              <div className="text-slate-100 font-medium">{fmtDate(D?.fecha_emision)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">País emisor</div>
              <div className="text-slate-100 font-medium">{D?.pais_emisor || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Moneda</div>
              <div className="text-slate-100 font-medium">{D?.moneda || '—'}</div>
            </div>
          </div>

          {/* Valor aduana resaltado */}
          <div className="mb-4">
            <div className="text-slate-400 text-xs">Valor aduana</div>
            <div className="text-2xl font-semibold text-slate-100">
              {fmtMoney(D?.valor_aduana_total)}
            </div>
          </div>

          {/* Importador / Exportador */}
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div className="rounded-lg border border-slate-700/60 p-4">
              <div className="text-slate-300 font-semibold mb-3">Importador</div>
              <InfoRow label="Nombre" value={D?.importador?.nombre} />
              <InfoRow label="Documento" value={D?.importador?.documento} />
              <InfoRow label="País" value={D?.importador?.pais} />
            </div>
            <div className="rounded-lg border border-slate-700/60 p-4">
              <div className="text-slate-300 font-semibold mb-3">Exportador</div>
              <InfoRow label="Nombre" value={D?.exportador?.nombre} />
              <InfoRow label="Documento" value={D?.exportador?.documento} />
              <InfoRow label="País" value={D?.exportador?.pais} />
            </div>
          </div>

          {/* Transporte */}
          <div className="rounded-lg border border-slate-700/60 p-4">
            <div className="text-slate-300 font-semibold mb-3">Transporte</div>
            <div className="grid md:grid-cols-4 gap-4">
              <InfoRow label="Medio" value={D?.transporte?.medio} />
              <InfoRow label="Placa" value={D?.transporte?.placa} />
              <InfoRow label="Conductor" value={D?.transporte?.conductor} />
              <InfoRow label="Ruta" value={D?.transporte?.ruta} />
            </div>
          </div>

          {/* Nota para el revisor */}
          <p className="text-slate-400 text-xs mt-4">
            Revisa que los datos coincidan con la documentación presentada. Usa los botones de
            <span className="text-cyan-300"> Aprobar</span> o
            <span className="text-rose-300"> Rechazar</span> en la tabla superior.
          </p>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-slate-100">{value || '—'}</div>
    </div>
  )
}
