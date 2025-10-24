// src/components/ActionDialog.jsx
import React from "react";

export default function ActionDialog({
  open,
  onClose,
  numero,        // DUCA-xxxx
  accion,        // "aprobar" | "rechazar"
  onConfirm,     // (comentario) => Promise<void>
  loading = false,
}) {
  const [comentario, setComentario] = React.useState("");

  React.useEffect(() => {
    if (open) setComentario("");
  }, [open]);

  if (!open) return null;

  const title = accion === "aprobar" ? "Aprobar declaración" : "Rechazar declaración";
  const actionColor =
    accion === "aprobar"
      ? "bg-cyan-600 hover:bg-cyan-500"
      : "bg-rose-600 hover:bg-rose-500";

  const disabled = loading || comentario.trim().length < 5;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 text-zinc-100 ring-1 ring-white/10 shadow-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="opacity-80 hover:opacity-100" onClick={onClose}>✕</button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-zinc-300">
            Número: <span className="font-medium">{numero}</span>
          </p>

          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 mb-1">
              Comentario (obligatorio, mínimo 5 caracteres)
            </label>
            <textarea
              rows={5}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full resize-y rounded-lg bg-zinc-800/60 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600"
              placeholder={
                accion === "aprobar"
                  ? "Ej. Cumple requisitos: documentación completa, valores coinciden, etc."
                  : "Ej. Faltan documentos: factura o guía, inconsistencia en valores, etc."
              }
            />
            <div className="mt-1 text-xs text-zinc-400">
              {comentario.trim().length < 5
                ? `Te faltan ${Math.max(5 - comentario.trim().length, 0)} caracteres.`
                : "Comentario válido."}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(comentario.trim())}
            className={`px-4 py-2 rounded-lg ${actionColor} disabled:opacity-50`}
            disabled={disabled}
          >
            {loading ? "Procesando..." : accion === "aprobar" ? "Aprobar" : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}
