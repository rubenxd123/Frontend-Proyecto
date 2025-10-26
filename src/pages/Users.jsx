import { useEffect, useState } from "react";
import { crearUsuario, getUsuarios, setUsuarioActivo } from "../api";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "TRANSPORTISTA",
  });

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

  async function toggleActivo(u) {
    try {
      const nuevo = !u.activo;
      await setUsuarioActivo(u.id, nuevo);
      await load();
    } catch (e) {
      alert("Error cambiando estado: " + e.message);
    }
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="card">
        <h2 className="mb-2">Usuarios</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className={`btn ${
                        u.activo ? "btn-warning" : "btn-success"
                      }`}
                      onClick={() => toggleActivo(u)}
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

      <div className="card">
        <h2 className="mb-2">Crear usuario</h2>
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
    </div>
  );
}
