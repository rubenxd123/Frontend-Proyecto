// src/pages/Validacion.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  listarValidacionPendientes,
  aprobarDUCA,
  rechazarDUCA,
  detalleEstado,
} from '../api';

// ------------------------- Helpers de UI y formato -------------------------
const fmtFechaCortaHora = (isoLike) => {
  if (!isoLike) return '';
  try {
    const dt = new Date(isoLike);
    return dt.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return String(isoLike || '');
  }
};

const fmtNumeroMiles = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('es-GT');
};

// Mensajes limpios (sin JSON)
function extractHumanMessage(err) {
  const raw = (err && err.message) ? String(err.message) : String(err || '');
  // Si viene como {"error":"texto"} o texto suelto
  const m = raw.match(/"error"\s*:\s*"([^"]+)"/i);
  return (m && m[1]) || raw || 'Ocurrió un error.';
}

function toast(msg) {
  // Si ya usas un toast global, reemplaza esta línea por tu notificador.
  // Esta versión minimalista no muestra JSON.
  window.alert(msg);
}

// ------------------------- UI atómica -------------------------
function BloqueDato({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase opacity-70 tracking-wide">{label}</div>
      <div className="text-base">{value || <span className="opacity-50">—</span>}</div>
    </div>
  );
}

function SeccionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold mb-3 opacity-90">{title}</div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

// ------------------------- Panel de Detalle -------------------------
function DetalleDeclaracion({ detalle, onClose }) {
  // detalle = { numero, estado, historial, duca }
  const d = detalle?.duca || null;

  const numero      = d?.numero_documento || detalle?.numero || '';
  const fechaEmision= fmtFechaCortaHora(d?.fecha_emision);
  const paisEmisor  = d?.pais_emisor || '';
  const moneda      = d?.moneda || '';
  const valorAduana = fmtNumeroMiles(d?.valor_aduana_total);

  const imp = d?.importador || {};
  const exp = d?.exportador || {};
  const tra = d?.transporte || {};

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">
          Detalle de la Declaración
          <span className="ml-3 text-xs rounded-full bg-white/10 px-2 py-1">
            {numero}
          </span>
          {detalle?.estado && (
            <span className="ml-2 text-xs rounded-full bg-white/10 px-2 py-1">
              {detalle.estado}
            </span>
          )}
        </h3>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
        >
          Cerrar
        </button>
      </div>

      {/* Datos principales */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <SeccionCard title="Número">
          <BloqueDato label="Número" value={numero} />
        </SeccionCard>
        <SeccionCard title="Fecha emisión">
          <BloqueDato label="Fecha emisión" value={fechaEmision} />
        </SeccionCard>
        <SeccionCard title="País emisor">
          <BloqueDato label="País" value={paisEmisor} />
        </SeccionCard>
        <SeccionCard title="Moneda / Valor">
          <div className="grid grid-cols-2 gap-3">
            <BloqueDato label="Moneda" value={moneda} />
            <BloqueDato label="Valor aduana" value={valorAduana} />
          </div>
        </SeccionCard>
      </div>

      {/* Importador / Exportador */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <SeccionCard title="Importador">
          <div className="grid md:grid-cols-3 gap-3">
            <BloqueDato label="Nombre"    value={imp.nombre} />
            <BloqueDato label="Documento" value={imp.documento} />
            <BloqueDato label="País"      value={imp.pais} />
          </div>
        </SeccionCard>
        <SeccionCard title="Exportador">
          <div className="grid md:grid-cols-3 gap-3">
            <BloqueDato label="Nombre"    value={exp.nombre} />
            <BloqueDato label="Documento" value={exp.documento} />
            <BloqueDato label="País"      value={exp.pais} />
          </div>
        </SeccionCard>
      </div>

      {/* Transporte */}
      <div className="grid md:grid-cols-4 gap-4">
        <SeccionCard title="Transporte">
          <div className="grid md:grid-cols-4 gap-3">
            <BloqueDato label="Medio"      value={tra.medio} />
            <BloqueDato label="Placa"      value={tra.placa} />
            <BloqueDato label="Conductor"  value={tra.conductor} />
            <BloqueDato label="Ruta"       value={tra.ruta} />
          </div>
        </SeccionCard>
      </div>

      <div className="mt-6 text-xs opacity-70">
        Revisa que los datos coincidan con la documentación presentada. Usa los
        botones de <span className="font-semibold">Aprobar</span> o{' '}
        <span className="font-semibold">Rechazar</span> en la tabla superior.
      </div>
    </div>
  );
}

// ------------------------- Página de Validación -------------------------
export default function Validacion({ token: tokenProp }) {
  const token = useMemo(
    () => tokenProp || localStorage.getItem('token') || '',
    [tokenProp]
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  async function loadPendientes() {
    try {
      setLoading(true);
      const data = await listarValidacionPendientes(token);
      // Esperamos: [{numero_documento, estado_documento, creado_en}, ...]
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast(extractHumanMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleVer(numero) {
    try {
      setLoadingDetalle(true);
      const data = await detalleEstado(token, numero);
      setDetalle(data);
    } catch (e) {
      toast(extractHumanMessage(e));
    } finally {
      setLoadingDetalle(false);
    }
  }

  async function handleAprobar(numero) {
    const ok = window.confirm(`¿Aprobar la declaración ${numero}?`);
    if (!ok) return;
    try {
      await aprobarDUCA(token, numero);
      toast('Declaración aprobada.');
      await loadPendientes();
      if (detalle?.numero === numero) {
        // refrescar solo el estado visible
        setDetalle((prev) => prev ? { ...prev, estado: 'VALIDADA' } : prev);
      }
    } catch (e) {
      toast(extractHumanMessage(e));
    }
  }

  async function handleRechazar(numero) {
    let motivo = window.prompt(`Escribe el motivo del rechazo para ${numero}:`);
    if (motivo === null) return; // canceló
    motivo = motivo.trim();
    if (!motivo) {
      toast('Debes indicar un motivo.');
      return;
    }
    try {
      await rechazarDUCA(token, numero, motivo);
      toast('Declaración rechazada.');
      await loadPendientes();
      if (detalle?.numero === numero) {
        setDetalle((prev) => prev ? { ...prev, estado: 'RECHAZADA' } : prev);
      }
    } catch (e) {
      toast(extractHumanMessage(e));
    }
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex items-center mb-4">
        <h1 className="text-xl font-semibold">Pendientes / En revisión</h1>
        <button
          onClick={loadPendientes}
          className="ml-auto rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[1.2fr,1fr,1.4fr,1fr] gap-0 px-4 py-3 bg-white/5 text-sm font-semibold opacity-90">
          <div>Número</div>
          <div>Estado</div>
          <div>Creado</div>
          <div className="text-right pr-2">Acciones</div>
        </div>

        {rows.length === 0 && !loading && (
          <div className="p-4 text-sm opacity-70">No hay pendientes.</div>
        )}

        {rows.map((r) => {
          const numero = r.numero_documento || r.numero || '';
          const estado = r.estado_documento || r.estado || 'PENDIENTE';
          const creado = fmtFechaCortaHora(r.creado_en || r.creado || '');

          return (
            <div
              key={numero}
              className="grid grid-cols-[1.2fr,1fr,1.4fr,1fr] items-center px-4 py-3 border-t border-white/10 text-sm"
            >
              <div className="font-mono">{numero}</div>

              <div>
                <span className={`text-xs rounded-full px-2 py-1 ${
                  estado === 'PENDIENTE' ? 'bg-white/10' : 'bg-emerald-500/20'
                }`}>
                  {estado}
                </span>
              </div>

              <div className="opacity-80">{creado}</div>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="rounded-md bg-cyan-600/80 hover:bg-cyan-600 text-white px-3 py-1"
                  onClick={() => handleAprobar(numero)}
                >
                  Aprobar
                </button>
                <button
                  className="rounded-md bg-red-600/80 hover:bg-red-600 text-white px-3 py-1"
                  onClick={() => handleRechazar(numero)}
                >
                  Rechazar
                </button>
                <button
                  className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1"
                  onClick={() => handleVer(numero)}
                >
                  {loadingDetalle && detalle?.numero === numero ? 'Cargando…' : 'Ver'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Detalle */}
      {detalle && (
        <DetalleDeclaracion
          detalle={detalle}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
