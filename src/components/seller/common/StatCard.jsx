export default function StatCard({ icon: Icon, title, value, color, note }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon size={22} />
        </div>
        <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-400">
          {note}
        </span>
      </div>
      <h3 className="mt-6 text-3xl font-extrabold text-slate-950">{value}</h3>
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-5 h-1.5 rounded-full bg-slate-100">
        <div className="h-full w-4/5 rounded-full bg-orange-300" />
      </div>
    </div>
  );
}
