import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken, setRole, setEmail }) {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const res = await login({ email, password });
      setToken?.(res.token || "token-demo");
      setRole?.(res.role || "user");
      setEmail?.(res.email || email);
      nav("/");
    } catch (e) { setErr(e.message); }
  }

  return (
    <section className="container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="card" style={{ padding: 16, maxWidth: 420 }}>
        <div>
          <label>Correo</label>
          <input name="email" type="email" className="form-control" required />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Contraseña</label>
          <input name="password" type="password" className="form-control" required />
        </div>
        <button style={{ marginTop: 16 }} className="btn btn-primary">Entrar</button>
        {err && <div className="alert alert-danger" style={{ marginTop: 12 }}>Error: {err}</div>}
      </form>
    </section>
  );
}
