import { useEffect, useState } from "react";
import { obtenerEstados } from "../api";

export default function Estados() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await obtenerEstados();
        setData(res);
      } catch {
        setError("❌ Error al obtener los estados.");
      }
    })();
  }, []);

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl mb-4">Estados de mis declaraciones</h2>
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Estado</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.numero}</td>
              <td>{d.estado}</td>
              <td>{d.creado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
