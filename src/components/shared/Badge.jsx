const statusMap = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Finished: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Normal: "bg-blue-100 text-blue-600",
  Low: "bg-slate-100 text-slate-500",
};

const priorityMap = {
  Urgent: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Normal: "bg-blue-100 text-blue-600",
  Low: "bg-slate-100 text-slate-500",
};

/**
 * Badge — single component for all status and priority pills.
 * Pass a string like "Pending", "Finished", "High" — auto-maps to color.
 * Use variant="priority" for priority-specific colors.
 */
export default function Badge({ children, variant = "status", className = "" }) {
  const colorMap = variant === "priority" ? priorityMap : statusMap;
  const colorClass = colorMap[children] || "bg-slate-100 text-slate-500";

  return (
    <span
      className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
