import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import EmptyState from "./EmptyState";
import Button from "./Button";

/**
 * Table — sortable, paginated data table with skeleton loading and empty state.
 *
 * Props:
 *   columns: [{ key, label, sortable?, className? }]
 *   data: row objects
 *   loading: boolean — shows skeleton rows
 *   emptyState: { icon, title, message, actionLabel?, onAction? }
 *   page, totalPages, onPageChange — pagination controls (omit for no pagination)
 *   sortKey, sortDir ('asc'|'desc'), onSort — sorting controls
 *   onRowClick: (row) => void
 */
export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyState,
  page,
  totalPages,
  onPageChange,
  sortKey,
  sortDir = "asc",
  onSort,
  onRowClick,
  className = "",
}) {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronDown className="ml-1 h-3 w-3 text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="ml-1 h-3 w-3 text-blue-500" />
      : <ChevronDown className="ml-1 h-3 w-3 text-blue-500" />;
  };

  return (
    <div className={`rounded-2xl bg-white shadow-[var(--shadow-card)] ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 font-bold ${
                    col.sortable ? "cursor-pointer select-none hover:text-slate-600" : ""
                  } ${col.className || ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Skeleton loading */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="border-b border-slate-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Data rows */}
            {!loading &&
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`border-b border-slate-100 transition ${
                    onRowClick
                      ? "cursor-pointer hover:bg-blue-50/50"
                      : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-4 ${col.className || ""}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!loading && data.length === 0 && emptyState && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState {...emptyState} className="border-none" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {page && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={ChevronLeft}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconRight={ChevronRight}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
