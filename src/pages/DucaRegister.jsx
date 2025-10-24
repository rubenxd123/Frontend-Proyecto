import { useState } from "react";
import { crearDuca } from "../api";

export default function DucaRegister() {
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk(""); setErr("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    // Backend espera: numero, paisEmisor, moneda, valorAduanaTotal, estado(opc)
    try {
      const r = await crearDuca(payload);
      setOk(r.message || "DUCA registrada");
      e.currentTarget.reset();
    } catch (e) { setErr(e.message); }
  }

  return (
    <section className="container">
      <h2>Registrar DUCA</h2>
      <form onSubmit={onSubmit} className="card" style={{ padding: 16 }}>
        <div className="row">
          <div className="col">
            <label>Número</label>
            <input name="numero" className="form-control" required />
          </div>
          <div className="col">
            <label>País Emisor</label>
            <input name="paisEmisor" className="form-control" required />
          </div>
          <div className="col">
            <label>Moneda</label>
            <input name="moneda" className="form-control" defaultValue="USD" required />
          </div>
          <div className="col">
            <label>Valor Aduana Total</label>
            <input name="valorAduanaTotal" type="number" step="0.01" className="form-control" required />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Estado (opcional)</label>
          <select name="estado" className="form-control" defaultValue="">
            <option value="">(por defecto: Pendiente)</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>

        <button style={{ marginTop: 16 }} className="btn btn-primary">Registrar</button>
        {ok && <div className="alert alert-success" style={{marginTop:12}}>{ok}</div>}
        {err && <div className="alert alert-danger" style={{marginTop:12}}>Error: {err}</div>}
      </form>
    </section>
  );
}
