import Button from "./Button";

/**
 * EmptyState — shown when a table/list has zero rows.
 */
export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center ${className}`}
    >
      {Icon && <Icon className="mb-4 h-10 w-10 text-slate-300" />}
      <h3 className="text-lg font-semibold text-slate-600">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-slate-400">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
