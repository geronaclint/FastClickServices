import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Ticket,
  ListChecks,
} from "lucide-react";
import {
  getTickets,
  updateTicketStatus,
  deleteTicket as apiDeleteTicket,
} from "../../services/ticketService";
import {
  getServiceRequests,
  updateServiceRequestStatus,
  deleteServiceRequest as apiDeleteServiceRequest,
} from "../../services/serviceRequestService";
import Badge from "../../components/seller/common/Badge";
import HeaderTitle from "../../components/seller/common/HeaderTitle";
import ConfirmModal from "../../components/seller/common/ConfirmModal";
import DetailsModal from "../../components/seller/common/DetailsModal";
import exportCsv from "../../components/seller/utils/exportCsv";

export default function TablePage({ type }) {
  const isTicket = type === "tickets";

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const fetcher = isTicket ? getTickets : getServiceRequests;
      fetcher()
        .then((res) => {
          if (res.success) setRows(res.data);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
          const hash = window.location.hash.replace("#", "");
          if (hash) {
            setHighlightId(parseInt(hash));
            setTimeout(() => {
              const el = document.getElementById(`row-${hash}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
            setTimeout(() => setHighlightId(null), 3000);
          }
        });
    };

    fetchData();

    const interval = setInterval(() => {
      const fetcher = isTicket ? getTickets : getServiceRequests;
      fetcher()
        .then((res) => {
          if (res.success) setRows(res.data);
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [isTicket]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const label = isTicket ? row.ticket_type : row.service_type;
      const keyword =
        `${row.id} ${row.customer_name || ""} ${row.customer_email || ""} ${label} ${row.location || ""} ${row.description || ""}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      const matchesStatus = status === "All Status" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status, isTicket]);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const updater = isTicket ? updateTicketStatus : updateServiceRequestStatus;
      const res = await updater(id, nextStatus);
      if (res.success) {
        setRows((prev) =>
          prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row))
        );
        setToast(`#${id} marked as ${nextStatus}.`);
        setTimeout(() => setToast(""), 1800);
      } else {
        setToast(`Failed: ${res.message}`);
        setTimeout(() => setToast(""), 3000);
      }
    } catch {}
  };

  const askConfirm = (id, nextStatus) => {
    const label = nextStatus === "Finished" ? "FINISH" : "CANCEL";
    setConfirmAction({ id, action: nextStatus, label });
  };

  const handleDelete = async (row) => {
    try {
      const deleter = isTicket ? apiDeleteTicket : apiDeleteServiceRequest;
      const res = await deleter(row.id);
      if (res.success) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setToast(`#${row.id} deleted.`);
        setTimeout(() => setToast(""), 1800);
      }
    } catch {}
    setDeleteConfirm(null);
  };

  const replyItem = (row, isTicketItem) => {
    const email = row.customer_email || "";
    const typeLabel = isTicketItem ? "Ticket" : "Service Request";
    const itemType = isTicketItem ? row.ticket_type : row.service_type;
    const subject = encodeURIComponent(`RE: ${typeLabel} #${row.id} — ${itemType}`);
    const body = encodeURIComponent(
      `Hello ${row.customer_name || "Customer"},\n\nRegarding your ${typeLabel.toLowerCase()} #${row.id} (${itemType}):\n\n`
    );

    if (email) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    } else {
      setToast(`No customer email available for this ${isTicketItem ? "ticket" : "request"}.`);
      setTimeout(() => setToast(""), 2200);
    }
  };

  const ticketStatCounts = useMemo(() => {
    if (!isTicket) return {};
    return {
      total: rows.length,
      processing: rows.filter((r) => r.status === "Processing").length,
      finished: rows.filter((r) => r.status === "Finished").length,
      pending: rows.filter((r) => r.status === "Pending").length,
    };
  }, [rows, isTicket]);

  return (
    <>
      <HeaderTitle
        icon={isTicket ? Ticket : ListChecks}
        title={isTicket ? "Manage Tickets" : "Manage Requests"}
        subtitle={
          isTicket
            ? "View and manage all customer support tickets"
            : "View and manage all customer orders"
        }
        action={
          <button
            type="button"
            onClick={() => exportCsv(filteredRows, isTicket)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
          >
            <Download size={16} className="mr-2 inline" />
            Export {isTicket ? "Tickets" : "Orders"}
          </button>
        }
      />

      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-[#351000] px-5 py-3 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {isTicket && (
        <div className="mb-5 grid grid-cols-4 gap-4">
          {[
            ["Total Tickets", ticketStatCounts.total, "bg-blue-50 text-blue-600 ring-blue-100"],
            ["Processing", ticketStatCounts.processing, "bg-orange-50 text-orange-500 ring-orange-100"],
            ["Finished", ticketStatCounts.finished, "bg-emerald-50 text-emerald-500 ring-emerald-100"],
            ["Pending", ticketStatCounts.pending, "bg-blue-50 text-blue-600 ring-blue-100"],
          ].map(([label, count, colorClass]) => (
            <div key={label} className={`rounded-xl bg-white p-5 ring-1 ${colorClass.split(" ")[2] || "ring-blue-100"}`}>
              <b className={`mr-3 text-2xl ${colorClass.split(" ")[1] || "text-blue-600"}`}>{count}</b>
              {label}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
        <div className="flex gap-3 border-b border-orange-100 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 outline-none"
              placeholder="Search by ID, customer, description..."
            />
          </div>

          <Filter className="mt-3 text-slate-400" size={18} />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4"
          >
            <option>All Status</option>
            <option>Processing</option>
            <option>Pending</option>
            <option>Finished</option>
            <option>Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                {[
                  "ID",
                  "Customer",
                  isTicket ? "Ticket Type" : "Service Type",
                  "Status",
                  "Priority",
                  "Date",
                  "Actions",
                ].map((header) => (
                  <th className="px-5 py-4" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  className={`border-t border-orange-100 transition-colors duration-1000 ${
                    highlightId === row.id ? "bg-amber-100/60 ring-2 ring-amber-400" : ""
                  }`}
                  key={row.id}
                  id={`row-${row.id}`}
                >
                  <td
                    className={`px-5 py-5 font-bold ${
                      isTicket ? "text-blue-600" : "text-orange-500"
                    }`}
                  >
                    #{row.id}
                  </td>

                  <td className="px-5 py-5">
                    <p className="font-bold">{row.customer_name || "Customer"}</p>
                    <p
                      className="max-w-[180px] truncate text-xs text-slate-400"
                      title={row.customer_email || ""}
                    >
                      {row.customer_email || ""}
                    </p>
                    {row.phone && <p className="text-xs text-slate-400">{row.phone}</p>}
                  </td>

                  <td className="px-5 py-5">
                    <p>{isTicket ? row.ticket_type : row.service_type}</p>
                    <p className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
                      {row.description || (isTicket ? "" : row.location || "")}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <Badge>{row.status}</Badge>
                  </td>

                  <td className="px-5 py-5">
                    <Badge>{row.priority}</Badge>
                  </td>

                  <td className="px-5 py-5 text-slate-600">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelected({ ...row, onUpdateStatus: handleUpdateStatus })
                        }
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => replyItem(row, isTicket)}
                        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        title="Reply via Email"
                      >
                        <MessageSquare size={16} />
                      </button>

                      {row.status !== "Finished" && row.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => askConfirm(row.id, "Finished")}
                          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title={isTicket ? "Mark Resolved" : "Mark Finished"}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}

                      {row.status !== "Cancelled" && row.status !== "Finished" && (
                        <button
                          type="button"
                          onClick={() => askConfirm(row.id, "Cancelled")}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title={isTicket ? "Close Ticket" : "Cancel Request"}
                        >
                          <XCircle size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(row)}
                        className="rounded-lg p-2 text-red-400 transition hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-between border-t border-orange-100 p-5 text-sm text-slate-400">
          <span>
            Showing {filteredRows.length} of {rows.length}{" "}
            {isTicket ? "tickets" : "requests"}
          </span>
        </div>
      </div>

      <DetailsModal item={selected} isTicket={isTicket} onClose={() => setSelected(null)} />

      <ConfirmModal
        open={!!confirmAction}
        title={`Are you sure you want to ${confirmAction?.label}?`}
        message={
          confirmAction?.label === "FINISH"
            ? "This will mark the item as completed."
            : "This will cancel the item. This can't be undone easily."
        }
        confirmLabel={`Yes, ${confirmAction?.label}`}
        confirmColor={confirmAction?.label === "CANCEL" ? "red" : "green"}
        onConfirm={() => {
          if (confirmAction) handleUpdateStatus(confirmAction.id, confirmAction.action);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete this ${isTicket ? "ticket" : "service request"}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        confirmColor="red"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
