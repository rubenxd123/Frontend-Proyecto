// frontend/src/pages/Estados.jsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Estados() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/estados");
        setData(Array.isArray(res) ? res : []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <section>
      <h3>Estados de mis declaraciones</h3>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Número</th><th>Estado</th><th>Creado</th></tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={3}>No hay registros.</td></tr>
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
