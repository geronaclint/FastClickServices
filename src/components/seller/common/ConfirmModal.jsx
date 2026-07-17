import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const btnColor =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : confirmColor === "green"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-orange-500 hover:bg-orange-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 font-bold text-white transition ${btnColor}`}
          >
            {confirmLabel || "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}
