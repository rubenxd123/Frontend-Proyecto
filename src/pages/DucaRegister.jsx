import { useState } from "react";
import { registrarDUCA } from "../api";

export default function DucaRegister() {
  const [form, setForm] = useState({
    numero: "",
    paisEmisor: "GT",
    moneda: "USD",
    valorAduanaTotal: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Registrando...");
    try {
      const res = await registrarDUCA(form);
      setMsg(`✅ ${res.message}`);
    } catch {
      setMsg("❌ Error al registrar DUCA");
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl mb-2">Registrar DUCA</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input name="numero" placeholder="Número" onChange={handleChange} required />
        <input name="paisEmisor" placeholder="País Emisor" value={form.paisEmisor} onChange={handleChange} />
        <input name="moneda" placeholder="Moneda" value={form.moneda} onChange={handleChange} />
        <input name="valorAduanaTotal" placeholder="Valor Aduana Total" onChange={handleChange} required />
        <button type="submit">Guardar</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
