import { Link, useNavigate } from 'react-router-dom'

export default function NavBar({ role, onLogout }) {
  const nav = useNavigate()
  const go = (p) => () => nav(p)
  return (
    <nav className="nav">
      <div className="container flex items-center gap-3 py-3">
        <button onClick={go('/')} className="font-bold text-cyan-400">DUCA</button>
        <div className="flex-1" />
        {role === 'ADMIN' && <Link className="link" to="/usuarios">Usuarios</Link>}
        {role === 'TRANSPORTISTA' && <Link className="link" to="/duca/registrar">Registrar DUCA</Link>}
        {role === 'TRANSPORTISTA' && <Link className="link" to="/estados">Estados</Link>}
        {role === 'AGENTE' && <Link className="link" to="/validacion">Validación</Link>}
        <button className="btn btn-outline ml-4" onClick={onLogout}>Salir</button>
      </div>
    </nav>
  )
}
