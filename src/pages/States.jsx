// src/pages/States.jsx
import React from "react";
import DetailModal from "../components/DetailModal";

const API_BASE = "https://aduanas-duca-api.onrender.com";

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

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/estados`);
      if (!res.ok) throw new Error("No se pudo cargar");
      const data = await res.json();
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
    <div className="container py-8">
      <h2 className="mb-4 text-xl font-semibold">Estados de mis declaraciones</h2>

      <div className="card">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
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
                  <td colSpan={4} className="text-center py-8 text-red-300">
                    {error}
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
