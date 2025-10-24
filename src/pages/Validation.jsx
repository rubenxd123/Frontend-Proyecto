// frontend/src/pages/Validation.jsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Validation() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/validacion");
        setData(Array.isArray(res) ? res : []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <section>
      <h3>Pendientes / En revisión</h3>

      {err && (
        <div className="alert alert-danger" role="alert">
          {err}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Número</th><th>Estado</th><th>Creado</th></tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={3}>No hay pendientes.</td></tr>
            ) : data.map((x,i)=>(
              <tr key={i}>
                <td>{x.numero}</td>
                <td>{x.estado}</td>
                <td>{x.creado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
