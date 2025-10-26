// src/pages/DucaRegister.jsx
import { useState } from "react";
import { registrarDUCA } from "../api";
import { useNavigate } from "react-router-dom";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DucaRegister() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    numeroDocumento: "DUCA-00X",
    fechaEmision: todayISO(),
    paisEmisor: "GT",
    moneda: "USD",
    valorAduanaTotal: 1000,
    importador: { nombre: "Import SA", documento: "IMP-1", pais: "GT" },
    exportador: { nombre: "Export LLC", documento: "EXP-1", pais: "SV" },
    transporte: { medio: "terrestre", placa: "P123ABC", conductor: "Juan", ruta: "GT-SV" },
    mercancias: [{ itemNo: 1, descripcion: "Producto demo", cantidad: 10, unidad: "UND", valor: 1000 }],
  });

  const update = (path, value) => {
    const seg = path.split(".");
    setForm((prev) => {
      const draft = structuredClone(prev);
      let cur = draft;
      for (let i = 0; i < seg.length - 1; i++) cur = cur[seg[i]];
      cur[seg.at(-1)] = value;
      return draft;
    });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      // mapeo camelCase -> snake_case
      const payload = {
        numero_documento: form.numeroDocumento.trim(),
        fecha_emision: form.fechaEmision, // YYYY-MM-DD
        pais_emisor: form.paisEmisor,
        moneda: form.moneda,
        valor_aduana_total: Number(form.valorAduanaTotal),
        importador: form.importador,
        exportador: form.exportador,
        transporte: form.transporte,
        mercancias: form.mercancias, // opcional
      };

      await registrarDUCA(payload);
      alert("DUCA registrado con éxito.");
      nav("/estados");
    } catch (err) {
      setMsg(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="card">
        <h2 className="mb-4">Registrar DUCA</h2>

        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="label">Número</label>
            <input className="input" value={form.numeroDocumento}
              onChange={(e) => update("numeroDocumento", e.target.value)} required />
          </div>
          <div>
            <label className="label">Fecha emisión</label>
            <input className="input" type="date" value={form.fechaEmision}
              onChange={(e) => update("fechaEmision", e.target.value)} required />
          </div>
          <div>
            <label className="label">País emisor</label>
            <input className="input" value={form.paisEmisor}
              onChange={(e) => update("paisEmisor", e.target.value)} />
          </div>
          <div>
            <label className="label">Moneda</label>
            <input className="input" value={form.moneda}
              onChange={(e) => update("moneda", e.target.value)} />
          </div>
          <div>
            <label className="label">Valor aduana total</label>
            <input className="input" type="number" min="0" step="0.01"
              value={form.valorAduanaTotal}
              onChange={(e) => update("valorAduanaTotal", Number(e.target.value))} />
          </div>

          <div className="md:col-span-2"><h3 className="font-bold mt-4 mb-2">Importador</h3></div>
          <div><label className="label">Nombre</label>
            <input className="input" value={form.importador.nombre}
              onChange={(e) => update("importador.nombre", e.target.value)} />
          </div>
          <div><label className="label">Documento</label>
            <input className="input" value={form.importador.documento}
              onChange={(e) => update("importador.documento", e.target.value)} />
          </div>

          <div className="md:col-span-2"><h3 className="font-bold mt-4 mb-2">Exportador</h3></div>
          <div><label className="label">Nombre</label>
            <input className="input" value={form.exportador.nombre}
              onChange={(e) => update("exportador.nombre", e.target.value)} />
          </div>
          <div><label className="label">Documento</label>
            <input className="input" value={form.exportador.documento}
              onChange={(e) => update("exportador.documento", e.target.value)} />
          </div>

          <div className="md:col-span-2"><h3 className="font-bold mt-4 mb-2">Transporte</h3></div>
          <div><label className="label">Medio</label>
            <input className="input" value={form.transporte.medio}
              onChange={(e) => update("transporte.medio", e.target.value)} />
          </div>
          <div><label className="label">Placa</label>
            <input className="input" value={form.transporte.placa}
              onChange={(e) => update("transporte.placa", e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>

        {msg && <p className="text-red-400 text-sm mt-3">{msg}</p>}
      </div>
    </div>
  );
}
