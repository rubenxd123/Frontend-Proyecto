export default function Home() {
  return (
    <div className="container py-8">
      <div className="card">
        <h1 className="mb-2">Sistema DUCA</h1>
        <p className="text-slate-300">Selecciona una opción en el menú según tu rol.</p>
        <ul className="list-disc pl-6 mt-3 text-slate-300 text-sm">
          <li><strong>ADMIN</strong>: gestionar usuarios.</li>
          <li><strong>TRANSPORTISTA</strong>: registrar declaración y consultar estados.</li>
          <li><strong>AGENTE</strong>: validar (aprobar/rechazar) declaraciones.</li>
        </ul>
      </div>
    </div>
  )
}
