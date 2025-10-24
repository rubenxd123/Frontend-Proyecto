// src/pages/Validacion.jsx
import React from "react";
import { getJSON, postJSON } from "../api";
import ActionDialog from "../components/ActionDialog";

function Badge({ value }) {
  const v = String(value || "").toUpperCase();
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold";
  const map = {
    PENDIENTE: "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40",
    EN_REVISION: "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40",
    VALIDADA: "bg-green-500/20 text-green-300 ring-1 ring-green-500/40",
    RECHAZADA: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40",
  };
  return <span className={`${base} ${map[v] || "bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/40"}`}>{v || "-"}</span>;
}

export default function Validacion() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  const [dlg, setDlg] = React.useState({
    open: false,
    numero: null,
    accion: null, // "aprobar" | "rechazar"
    loading: false,
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getJSON("/validacion/pendientes");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Error al cargar");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  function openDialog(numero, accion) {
    setDlg({ open: true, numero, accion, loading: false });
  }

  function closeDialog() {
    setDlg((s) => ({ ...s, open: false }));
  }

  async function handleConfirm(comentario) {
    setDlg((s) => ({ ...s, loading: true }));
    const { numero, accion } = dlg;
    try {
      // Endpoints esperados en el backend:
      // POST /validacion/:numero/aprobar { comentario }
      // POST /validacion/:numero/rechazar { comentario }
      const url = `/validacion/${encodeURIComponent(numero)}/${accion}`;
      await postJSON(url, { comentario });

      closeDialog();
      await load();
    } catch (e) {
      closeDialog();
      alert(e.message || "Acción falló");
    }
  }

  return (
    <div className="container py-8">
      <h2 className="mb-4 text-xl font-semibold">Pendientes / En revisión</h2>

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

              {!loading && err && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-rose-300">
                    {err}
                  </td>
                </tr>
              )}

              {!loading && !err && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-zinc-400">
                    Sin registros pendientes.
                  </td>
                </tr>
              )}

              {!loading &&
                !err &&
                items.map((r) => (
                  <tr key={r.numero}>
                    <td>
                      <a className="link" href="#" onClick={(e) => e.preventDefault()}>
                        {r.numero}
                      </a>
                    </td>
                    <td>
                      <Badge value={r.estado} />
                    </td>
                    <td>{new Date(r.creado).toLocaleDateString()}</td>
                    <td className="space-x-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => openDialog(r.numero, "aprobar")}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => openDialog(r.numero, "rechazar")}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de acción con comentario obligatorio */}
      <ActionDialog
        open={dlg.open}
        onClose={closeDialog}
        numero={dlg.numero}
        accion={dlg.accion}
        loading={dlg.loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
