import { useEffect, useState } from "react";
import { obtenerPendientes } from "../api";

export default function Validation() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await obtenerPendientes();
        setData(res);
      } catch {
        setError("❌ Error al obtener validaciones.");
      }
    })();
  }, []);

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl mb-4">Pendientes / En revisión</h2>
      {error && <p>{error}</p>}
      {data.length === 0 ? (
        <p>No hay pendientes.</p>
      ) : (
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
      )}
    </div>
  );
}
