import { useEffect } from "react";

export default function Toast({ open, type="success", message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 300000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  const color = type === "success"
    ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
    : "bg-rose-500/10 border-rose-400 text-rose-300";

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all ${
      open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
    }`}>
      <div className={`px-4 py-3 rounded-xl shadow-xl border ${color}`}>
        <div className="flex gap-3 items-start">
          <strong>{type === "success" ? "Éxito" : "Error"}</strong>
          <button className="ml-auto" onClick={onClose}>✕</button>
        </div>
        <div className="text-sm mt-1">{message}</div>
      </div>
    </div>
  );
}
