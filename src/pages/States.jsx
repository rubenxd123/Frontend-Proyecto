// src/pages/States.jsx
import React from "react";
import DetailModal from "../components/DetailModal";
import { fetchJSON } from "../api";

export default function States() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [openDetail, setOpenDetail] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  function statusBadgeClass(statusRaw) {
    const s = String(statusRaw || "").toUpperCase();
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold";
    switch (s) {
      case "PENDIENTE":
        return `${base} bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40`;
    }
    return `${base} bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/40`;
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON("/estados", { timeout: 12000 });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const verDetalle = (item) => {
    setSelected(item);
    setOpenDetail(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <h2 className="mb-4 text-xl font-semibold">Estados de mis declaraciones</h2>

      <div className="rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left">Número</th>
                <th className="text-left">Estado</th>
                <th className="text-left">Creado</th>
                <th className="text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-400">
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="text-red-300">{error}</div>
                      <button className="btn btn-primary" onClick={loadData}>
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-400">
                    Sin registros
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                items.map((it) => (
                  <tr key={it.numero}>
                    <td>
                      <button
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                        onClick={() => verDetalle(it)}
                      >
                        {it.numero}
                      </button>
                    </td>
                    <td>
                      <span className={statusBadgeClass(it.estado)}>{it.estado}</span>
                    </td>
                    <td>{it.creado ? new Date(it.creado).toLocaleDateString() : "-"}</td>
                    <td>
                      <button className="btn btn-soft" onClick={() => verDetalle(it)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <DetailModal open={openDetail} onClose={() => setOpenDetail(false)} baseItem={selected} />
    </div>
  );
}
