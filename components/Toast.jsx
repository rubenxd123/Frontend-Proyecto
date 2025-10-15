import { useEffect } from "react";

export default function Toast({ open, type = "success", message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3000); // se cierra solo en 3s
    return () => clearTimeout(t);
  }, [open, onClose]);

  const color =
    type === "success"
      ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
      : "bg-red-500/10 border-red-400 text-red-300";

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className={`px-4 py-3 rounded-xl shadow-xl border ${color}`}>
        <div className="flex items-start gap-3">
          <div className="font-semibold">{type === "success" ? "Éxito" : "Error"}</div>
          <button className="ml-auto text-slate-300 hover:text-white" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="text-sm mt-1">{message}</div>
      </div>
    </div>
  );
}
