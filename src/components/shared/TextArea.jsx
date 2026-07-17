/**
 * TextArea — multi-line input with character count support.
 */
export default function TextArea({
  label,
  helperText,
  error,
  className = "",
  id,
  required,
  maxLength,
  showCharCount,
  value = "",
  rows = 4,
  ...props
}) {
  const areaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={areaId} className="mb-2 block text-sm font-semibold text-slate-900">
          {label}
          {required && <span className="ml-0.5 text-orange-500">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
        } ${props.disabled ? "cursor-not-allowed opacity-60" : ""}`}
        {...props}
      />
      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <p className="text-xs font-semibold text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : (
          <span />
        )}
        {showCharCount && (
          <span className="text-xs text-slate-400">
            {typeof value === "string" ? value.length : 0}
            {maxLength ? ` / ${maxLength}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
