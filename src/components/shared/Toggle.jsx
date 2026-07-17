/**
 * Toggle — accessible switch component using <button role="switch">.
 */
export default function Toggle({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          checked ? "bg-blue-600" : "bg-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
          style={{ marginTop: "2px" }}
        />
      </button>
    </div>
  );
}
