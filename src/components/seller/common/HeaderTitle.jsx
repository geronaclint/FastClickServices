export default function HeaderTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-7 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Icon />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
