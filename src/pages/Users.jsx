import { useEffect, useState, useCallback } from "react";
import { crearUsuario, getUsuarios, setUsuarioActivo } from "../api";

/* ==================== Modal de Confirmación ==================== */
function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!open) return null;

  const handleOverlay = (e) => {
    if (loading) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    },
    [loading, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      onClick={handleOverlay}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg bg-slate-900 text-slate-100 border border-slate-700 rounded-2xl shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 text-slate-300 whitespace-pre-wrap">{message}</div>

        <div className="px-5 py-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-2 rounded-md border border-slate-600 bg-slate-800 hover:bg-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3 py-2 rounded-md text-white ${
              loading
                ? "bg-slate-700 cursor-wait"
                : "bg-teal-600 hover:bg-teal-500"
            }`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== Página de Usuarios ==================== */
export default function Users() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "TRANSPORTISTA",
  });

  // estado del modal
  const [confirm, setConfirm] = useState({
    open: false,
    user: null,
    nextActive: false,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  async function load() {
    setMsg("");
    try {
      const data = await getUsuarios();
      setRows(data || []);
    } catch (e) {
      setMsg(String(e.message || e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setMsg("");
    try {
      await crearUsuario(form);
      setForm({ nombre: "", correo: "", password: "", rol: "TRANSPORTISTA" });
      await load();
    } catch (e) {
      setMsg(String(e.message || e));
    }
  }

  function askToggleActivo(u) {
    setConfirm({
      open: true,
      user: u,
      nextActive: !u.activo,
    });
  }

  async function doToggleActivo() {
    if (!confirm.user) return;
    setConfirmLoading(true);
    try {
      await setUsuarioActivo(confirm.user.id, confirm.nextActive);
      // actualizar visualmente sin recargar toda la lista
      setRows((prev) =>
        prev.map((r) =>
          r.id === confirm.user.id ? { ...r, activo: confirm.nextActive } : r
        )
      );
      setConfirm({ open: false, user: null, nextActive: false });
    } catch (e) {
      alert("Error cambiando estado: " + (e.message || e));
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Listado */}
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-2 text-left">Nombre</th>
                <th className="py-2 text-left">Correo</th>
                <th className="py-2 text-left">Rol</th>
                <th className="py-2 text-center">Activo</th>
                <th className="py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-800 hover:bg-slate-900/40"
                >
                  <td className="py-2">{u.nombre}</td>
                  <td className="py-2">{u.correo}</td>
                  <td className="py-2">
                    <span className="inline-block bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-full">
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    {u.activo ? (
                      <span className="text-emerald-400 font-semibold">Sí</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">No</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => askToggleActivo(u)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                        u.activo
                          ? "bg-slate-800 border-rose-600 text-rose-300 hover:bg-rose-900/40"
                          : "bg-slate-800 border-emerald-600 text-emerald-300 hover:bg-emerald-900/40"
                      }`}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p className="text-red-400 text-sm mt-2">{msg}</p>}
      </div>

      {/* Crear usuario */}
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold">Crear usuario</h2>
        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              className="input"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Rol</label>
            <select
              className="input"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option>TRANSPORTISTA</option>
              <option>AGENTE</option>
              <option>ADMIN</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button className="btn btn-primary">Crear</button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirm.open}
        loading={confirmLoading}
        title={confirm.nextActive ? "Activar usuario" : "Desactivar usuario"}
        message={
          confirm.user
            ? `¿Deseas ${confirm.nextActive ? "activar" : "desactivar"} al usuario:\n${confirm.user.nombre} <${confirm.user.correo}>?`
            : ""
        }
        confirmText={confirm.nextActive ? "Sí, activar" : "Sí, desactivar"}
        cancelText="Cancelar"
        onConfirm={doToggleActivo}
        onClose={() =>
          confirmLoading ? null : setConfirm({ open: false, user: null, nextActive: false })
        }
      />
    </div>
  );
}
