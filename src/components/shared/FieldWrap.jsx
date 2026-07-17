export default function FieldWrap({ label, required, icon: Icon, children, extra }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-900">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        {extra}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        {children}
      </div>
    </div>
  );
}
