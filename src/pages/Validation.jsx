import { useEffect, useState } from "react";
import { getPendientes } from "../api";

export default function Validation() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try { setData(await getPendientes()); }
      catch (e) { setErr(e.message); }
    })();
  }, []);

  return (
    <section className="container">
      <h2>Pendientes / En revisión</h2>
      {err && <div className="alert alert-danger">Error: {err}</div>}
      <div className="card">
        <table className="table">
          <thead><tr><th>Número</th><th>Estado</th><th>Creado</th></tr></thead>
          <tbody>
            {Array.isArray(data) && data.length ? data.map((x, i) => (
              <tr key={i}><td>{x.numero}</td><td>{x.estado}</td><td>{x.creado}</td></tr>
            )) : <tr><td colSpan={3}>No hay pendientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
