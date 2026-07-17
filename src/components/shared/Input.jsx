/**
 * Input — text input with label, left icon, helper text, and error state.
 * Uses the design tokens for consistent styling.
 */
export default function Input({
  label,
  icon: Icon,
  helperText,
  error,
  className = "",
  id,
  required,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-900">
          {label}
          {required && <span className="ml-0.5 text-orange-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-slate-50 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
            Icon ? "pl-12 pr-4" : "px-4"
          } ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
          } ${props.disabled ? "cursor-not-allowed opacity-60" : ""}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
