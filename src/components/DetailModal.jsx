// src/components/DetailModal.jsx
import React from "react";
import { API_BASE } from "../api";

/* ====================== Helpers ====================== */
function formatFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  if (!isNaN(d.getTime())) return d.toLocaleDateString();
  return String(fecha);
}
function formatMoney(v, currency = "USD") {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "-";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return new Intl.NumberFormat().format(n);
  }
}
function statusBadgeClass(statusRaw) {
  const s = String(statusRaw || "").toUpperCase();
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold";
  switch (s) {
    case "PENDIENTE":
      return `${base} bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40`;
    case "EN_REVISION":
    case "EN-REVISION":
    case "EN REVISION":
      return `${base} bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40`;
    case "VALIDADA":
      return `${base} bg-green-500/20 text-green-300 ring-1 ring-green-500/40`;
    case "RECHAZADA":
      return `${base} bg-red-500/20 text-red-300 ring-1 ring-red-500/40`;
    default:
      return `${base} bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/40`;
  }
}
async function fetchDucaDetail(numero) {
  try {
    const res = await fetch(`${API_BASE}/duca/${encodeURIComponent(numero)}`);
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

/* ====================== UI atoms ====================== */
function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-zinc-400 mb-1">{label}</label>
      <div className="rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm text-zinc-100">
        {value ?? "-"}
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-zinc-200">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function PrettyObject({ value }) {
  if (value == null || value === "") {
    return (
      <div className="rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm text-zinc-100">
        -
      </div>
    );
  }

  let data = value;
  if (typeof value === "string") {
    const t = value.trim();
    if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
      try {
        data = JSON.parse(t);
      } catch {
        data = value;
      }
    }
  }

  if (data && typeof data === "object") {
    const entries = Array.isArray(data)
      ? data.map((v, i) => [i, v])
      : Object.entries(data);

    if (entries.length === 0) {
      return (
        <div className="rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm text-zinc-100">
          -
        </div>
      );
    }

    return (
      <div className="rounded-lg bg-zinc-800/60 border border-white/10 p-3 text-sm text-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {entries.map(([k, v], idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 rounded-lg bg-zinc-900/50 px-3 py-2 border border-white/5"
            >
              <div className="text-xs text-zinc-400">{String(k)}</div>
              <div className="text-right break-words">
                {typeof v === "object" ? JSON.stringify(v) : String(v ?? "-")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm text-zinc-100">
      {String(data)}
    </div>
  );
}

/* ====================== Modal ====================== */
export default function DetailModal({ open, onClose, baseItem }) {
  const [loading, setLoading] = React.useState(false);
  const [detail, setDetail] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    if (open && baseItem?.numero) {
      setLoading(true);
      fetchDucaDetail(baseItem.numero)
        .then((d) => mounted && setDetail(d))
        .finally(() => mounted && setLoading(false));
    } else {
      setDetail(null);
    }
    return () => { mounted = false; };
  }, [open, baseItem?.numero]);

  if (!open) return null;

  const numero = detail?.numero ?? baseItem?.numero ?? "-";
  const estado = detail?.estado ?? baseItem?.estado ?? "-";
  const fecha = detail?.fecha_emision ?? baseItem?.creado ?? baseItem?.created;

  const pais = detail?.pais_emisor ?? "-";
  const moneda = detail?.moneda ?? "-";
  const valor = detail?.valor_aduana_total ?? "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-900 text-zinc-100 shadow-xl ring-1 ring-white/10">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/95 backdrop-blur">
          <h3 className="text-lg font-semibold">Detalle del registro</h3>
          <button onClick={onClose} className="text-sm opacity-80 hover:opacity-100">
            Cerrar ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Número" value={numero} />
            <div className="flex flex-col">
              <label className="text-xs text-zinc-400 mb-1">Estado</label>
              <div className="rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm">
                <span className={statusBadgeClass(estado)}>{estado}</span>
              </div>
            </div>
            <Field label="Fecha emisión" value={formatFecha(fecha)} />
          </div>

          {loading && <p className="text-sm text-zinc-400">Cargando detalle…</p>}

          {!loading && (
            <div className="space-y-6">
              <Section title="Datos generales">
                <Field label="País emisor" value={pais} />
                <Field label="Moneda" value={moneda} />
                <Field
                  label="Valor aduana total"
                  value={valor !== "-" ? formatMoney(valor, String(moneda || "USD")) : "-"}
                />
              </Section>

              <Section title="Importador">
                <div className="md:col-span-2">
                  <PrettyObject value={detail?.importador} />
                </div>
              </Section>

              <Section title="Exportador">
                <div className="md:col-span-2">
                  <PrettyObject value={detail?.exportador} />
                </div>
              </Section>

              <Section title="Transporte">
                <div className="md:col-span-2">
                  <PrettyObject value={detail?.transporte} />
                </div>
              </Section>

              {detail == null && (
                <p className="text-sm text-zinc-400">
                  No hay información adicional. Verifica el endpoint <code>/duca/:numero</code>.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex justify-end sticky bottom-0 bg-zinc-900/95 backdrop-blur">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
