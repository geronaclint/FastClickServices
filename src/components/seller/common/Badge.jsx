export default function Badge({ children }) {
  const map = {
    Pending: "bg-blue-100 text-blue-600",
    Processing: "bg-orange-100 text-orange-600",
    Finished: "bg-emerald-100 text-emerald-600",
    Cancelled: "bg-red-100 text-red-600",
    Urgent: "bg-red-100 text-red-600",
    High: "bg-orange-100 text-orange-600",
    Normal: "bg-blue-100 text-blue-600",
    Low: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`rounded-xl px-3 py-1 text-xs font-semibold ${
        map[children] || "bg-slate-100 text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}
