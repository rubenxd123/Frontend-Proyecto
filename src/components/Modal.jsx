export default function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button className="ml-auto btn btn-outline" onClick={onClose}>Cerrar</button>
          </div>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
