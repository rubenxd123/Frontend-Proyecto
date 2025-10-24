import React, { useEffect, useState } from "react";

function formatDateCell(item) {
  const candidates = [
    item?.creado,
    item?.created,
    item?.createdAt,
    item?.created_at,
    item?.fecha_emision,
    item?.fechaEmision,
    item?.created_iso,
    item?.created_date,
  ];

  for (const v of candidates) {
    if (v == null) continue;

    if (v instanceof Date && !isNaN(v.getTime())) {
      return v.toLocaleDateString();
    }

    if (typeof v === "number" && !Number.isNaN(v)) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    }

    if (typeof v === "string" && v.trim() !== "") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
      return v.length > 10 ? v.slice(0, 10) : v;
    }
  }

  return "-";
}

export default function States() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch("https://aduanas-duca-api.onrender.com/estados");
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Error fetching estados:", err);
        setData([]);
      }
    };

    fetchEstados();
  }, []);

  return (
    <div className="container py-8">
      <h2 className="mb-2">Estados de mis declaraciones</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ color: "red" }}>Sin registros</td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i}>
                  <td>{item.numero || item.number || "-"}</td>
                  <td><span className="badge">{item.estado || item.status}</span></td>
                  <td>{formatDateCell(item)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
