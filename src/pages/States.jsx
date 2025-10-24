import React, { useEffect, useState } from "react";

/* ====================== Utils comunes ====================== */

function formatDateCell(item) {
  const candidates = [
    item?.creado,
    item?.created,
    item?.createdAt,
    item?.created_at,
    item?.fecha_emision,
    item?.fechaEmision,
    item?.created_iso,
    item?.created_date,
  ];
  for (const v of candidates) {
    if (v == null) continue;
    if (v instanceof Date && !isNaN(v.getTime())) return v.toLocaleDateString();
    if (typeof v === "number" && !Number.isNaN(v)) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    }
    if (typeof v === "string" && v.trim() !== "") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
      return v.length > 10 ? v.slice(0, 10) : v;
    }
  }
  return "-";
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
    case "ANULADA":
      return `${base} bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/40`;
    default:
      return `${base} bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/40`;
  }
}

async function fetchDucaDetail(numero) {
  const base = "https://aduanas-duca-api.onrender.com";
  const endpoints = [
    `/duca/${encodeURIComponent(numero)}`,
    `/duca/detalle/${encodeURIComponent(numero)}`,
    `/estados/detalle?numero=${encodeURIComponent(numero)}`,
  ];
  for (const ep of endpoints) {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(base + ep, { signal: ctrl.signal });
      clearTimeout(id);
      if (res.ok) {
        const json = await res.json();
        if (json && typeof json === "object") return json;
      }
    } catch (_) {}
  }
  return null;
}

/* ====================== Modal de Detalle ====================== */

function DetailModal({ open, onClose, baseItem }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (open && baseItem?.numero) {
      setLoading(true);
      fetchDucaDetail(baseItem.numero)
        .then((d) => {
          if (!mounted) return;
          setDetail(d);
        })
        .finally(() => mounted && setLoading(false));
    } else {
      setDetail(null);
    }
    return () => {
      mounted = false;
    };
  }, [open, baseItem?.numero]);

  if (!open) return null;

  const rows = [
    ["Número", baseItem?.numero || baseItem?.number || "-"],
    ["Estado", baseItem?.estado || baseItem?.status || "-"],
    ["Creado", formatDateCell(baseItem)],
  ];

  if (detail && typeof detail === "object") {
    Object.entries(detail).forEach(([k, v]) => {
      if (v == null || String(v).trim() === "") return;
      const key = k.toLowerCase();
      if (["numero", "number", "estado", "status", "creado", "created"].some((p) => key.includes(p))) return;
      rows.push([k, typeof v === "object" ? JSON.stringify(v) : String(v)]);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 text-zinc-100 shadow-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Detalle del registro</h3>
          <button onClick={onClose} className="text-sm opacity-80 hover:opacity-100">
            Cerrar ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {rows.map(([label, value], idx) => (
              <div key={idx} className="flex flex-col">
                <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
                <dd className="text-sm mt-0.5 text-zinc-100 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          {loading && <p className="mt-4 text-sm text-zinc-400">Cargando detalle…</p>}
          {!loading && !detail && (
            <p className="mt-4 text-sm text-zinc-400">No hay información adicional disponible para este número.</p>
          )}
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn btn-primary px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================== Página de Estados ====================== */

export default function States() {
  const [data, setData] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch("https://aduanas-duca-api.onrender.com/estados");
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Error fetching estados:", err);
        setData([]);
      }
    };
    fetchEstados();
  }, []);

  const openWith = (item) => {
    setSelected(item);
    setOpenDetail(true);
  };

  return (
    <div className="container py-8">
      <h2 className="mb-2 text-xl font-semibold">Estados de mis declaraciones</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-300 border-b border-white/10">
              <th className="py-3">Número</th>
              <th className="py-3">Estado</th>
              <th className="py-3">Creado</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-6 text-center text-red-300">
                  Sin registros
                </td>
              </tr>
            ) : (
              data.map((item, i) => {
                const numero = item.numero || item.number || "-";
                const estado = item.estado || item.status || "-";
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <button
                        className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                        onClick={() => openWith(item)}
                        title="Ver detalle"
                      >
                        {numero}
                      </button>
                    </td>
                    <td className="py-3">
                      <span className={statusBadgeClass(estado)}>{estado}</span>
                    </td>
                    <td className="py-3">{formatDateCell(item)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        baseItem={selected}
      />
    </div>
  );
}
