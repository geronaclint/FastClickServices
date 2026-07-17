import { useEffect, useMemo, useState } from "react";
import { Search, Download, Eye, MessageSquare, CheckCircle2, XCircle, Trash2, Ticket, ListChecks } from "lucide-react";
import { getTickets, updateTicketStatus, deleteTicket as apiDeleteTicket } from "../../services/ticketService";
import { getServiceRequests, updateServiceRequestStatus, deleteServiceRequest as apiDeleteServiceRequest } from "../../services/serviceRequestService";
import Badge from "../../components/shared/Badge";
import Button from "../../components/shared/Button";
import Modal from "../../components/shared/Modal";
import Table from "../../components/shared/Table";
import exportCsv from "../../components/seller/utils/exportCsv";

export default function TablePage({ type }) {
  const isTicket = type === "tickets";

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const fetcher = isTicket ? getTickets : getServiceRequests;
    fetcher().then((res) => { if (res.success) setRows(res.data); }).catch(() => {}).finally(() => { setLoading(false);
      const hash = window.location.hash.replace("#", "");
      if (hash) { setHighlightId(parseInt(hash)); setTimeout(() => { const el = document.getElementById(`row-${hash}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100); setTimeout(() => setHighlightId(null), 3000); }
    });

    const interval = setInterval(() => {
      fetcher().then((res) => { if (res.success) setRows(res.data); }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [isTicket]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const label = isTicket ? row.ticket_type : row.service_type;
      const kw = `${row.id} ${row.customer_name || ""} ${label} ${row.description || ""}`.toLowerCase();
      return kw.includes(search.toLowerCase()) && (status === "All Status" || row.status === status);
    });
  }, [rows, search, status, isTicket]);

  const paginated = useMemo(() => filteredRows.slice((page - 1) * limit, page * limit), [filteredRows, page]);
  const totalPages = Math.ceil(filteredRows.length / limit);
  useEffect(() => { setPage(1); }, [search, status]);

  const handleUpdateStatus = async (id, nextStatus) => {
    const updater = isTicket ? updateTicketStatus : updateServiceRequestStatus;
    const res = await updater(id, nextStatus);
    if (res.success) { setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: nextStatus } : r)); setToast(`#${id} → ${nextStatus}`); setTimeout(() => setToast(""), 1800); }
    else { setToast(`Failed: ${res.message}`); setTimeout(() => setToast(""), 3000); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const deleter = isTicket ? apiDeleteTicket : apiDeleteServiceRequest;
    const res = await deleter(selected.id);
    if (res.success) { setRows((prev) => prev.filter((r) => r.id !== selected.id)); setToast(`#${selected.id} deleted.`); setTimeout(() => setToast(""), 1800); }
    setSelected(null);
  };

  const replyItem = (row) => {
    const email = row.customer_email || "";
    if (!email) { setToast("No customer email available."); setTimeout(() => setToast(""), 2200); return; }
    const subject = encodeURIComponent(`RE: ${isTicket ? "Ticket" : "Service Request"} #${row.id}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`, "_blank", "noopener,noreferrer");
  };

  const columns = [
    { key: "id", label: "ID", render: (r) => <span className={`font-bold ${isTicket ? "text-blue-600" : "text-orange-500"}`}>#{r.id}</span> },
    { key: "customer", label: "Customer", render: (r) => <div><p className="font-bold text-sm">{r.customer_name || "—"}</p><p className="max-w-[160px] truncate text-xs text-slate-400">{r.customer_email || ""}</p></div> },
    { key: "type", label: isTicket ? "Ticket Type" : "Service Type", render: (r) => <div><p className="text-sm">{isTicket ? r.ticket_type : r.service_type}</p><p className="max-w-[160px] truncate text-xs text-slate-400">{r.description || (isTicket ? "" : r.location || "")}</p></div> },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "priority", label: "Priority", render: (r) => <Badge variant="priority">{r.priority}</Badge> },
    { key: "created_at", label: "Date", render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "" },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex items-center gap-1">
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelected({ ...r, onUpdateStatus: handleUpdateStatus }); }} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Eye size={15} /></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); replyItem(r); }} className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"><MessageSquare size={15} /></button>
        {r.status !== "Finished" && r.status !== "Cancelled" && (
          <button type="button" onClick={(e) => { e.stopPropagation(); if (window.confirm("Mark as Finished?")) handleUpdateStatus(r.id, "Finished"); }} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><CheckCircle2 size={15} /></button>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelected(r); if (window.confirm("Delete this item?")) handleDelete(); }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
      </div>
    )},
  ];

  const ticketStatCounts = useMemo(() => {
    if (!isTicket) return {};
    return { total: rows.length, processing: rows.filter((r) => r.status === "Processing").length, finished: rows.filter((r) => r.status === "Finished").length, pending: rows.filter((r) => r.status === "Pending").length };
  }, [rows, isTicket]);

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><ListChecks /></div>
          <div><h2 className="text-2xl font-extrabold">{isTicket ? "Manage Tickets" : "Manage Requests"}</h2><p className="text-sm text-slate-500">{isTicket ? "View and manage all customer support tickets" : "View and manage all customer orders"}</p></div>
        </div>
        <Button variant="secondary" iconLeft={Download} onClick={() => exportCsv(filteredRows, isTicket)} className="w-full sm:w-auto">Export</Button>
      </div>

      {toast && <div className="fixed right-4 top-4 z-50 rounded-xl bg-[#351000] px-5 py-3 text-sm font-bold text-white shadow-lg">{toast}</div>}

      {isTicket && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Total", ticketStatCounts.total, "blue"], ["Processing", ticketStatCounts.processing, "orange"], ["Finished", ticketStatCounts.finished, "emerald"], ["Pending", ticketStatCounts.pending, "blue"]].map(([label, count, color]) => (
            <div key={label} className="rounded-xl bg-white p-4 shadow-sm"><b className={`text-lg text-${color}-500`}>{count}</b><p className="text-xs text-slate-500">{label}</p></div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-500" placeholder="Search by ID, customer, description..." /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <option>All Status</option><option>Processing</option><option>Pending</option><option>Finished</option><option>Cancelled</option>
        </select>
      </div>

      <Table columns={columns} data={paginated} loading={loading} emptyState={{ title: `No ${isTicket ? "tickets" : "requests"} found`, message: search || status !== "All Status" ? "Try adjusting your filters." : `No ${isTicket ? "tickets" : "requests"} yet.` }}
        page={page} totalPages={totalPages} onPageChange={setPage} onRowClick={(r) => setSelected({ ...r, onUpdateStatus: handleUpdateStatus })} />

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={isTicket ? "Ticket Details" : "Request Details"}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-slate-400">Customer</p><p className="font-bold">{selected.customer_name || "—"}</p></div>
              <div><p className="text-slate-400">Email</p><p className="font-bold">{selected.customer_email || "—"}</p></div>
              <div><p className="text-slate-400">Phone</p><p className="font-bold">{selected.phone || selected.customer_phone || "—"}</p></div>
              <div><p className="text-slate-400">Plan</p><Badge>{selected.customer_subscription || "Free"}</Badge></div>
              <div><p className="text-slate-400">{isTicket ? "Ticket Type" : "Service Type"}</p><p className="font-bold">{isTicket ? selected.ticket_type : selected.service_type}</p></div>
              {!isTicket && <div><p className="text-slate-400">Location</p><p className="font-bold">{selected.location || "—"}</p></div>}
              <div><p className="text-slate-400">Status</p><Badge>{selected.status}</Badge></div>
              <div><p className="text-slate-400">Priority</p><Badge variant="priority">{selected.priority}</Badge></div>
            </div>
            <div className="max-h-[120px] overflow-y-auto rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-xs font-bold text-slate-400">Description</p>
              <p className="text-sm">{selected.description || "No description."}</p>
            </div>
            {selected.status === "Pending" && (
              <Button className="w-full" onClick={() => { handleUpdateStatus(selected.id, "Processing"); setSelected(null); }}>Mark as Processing</Button>
            )}
            <Button variant="secondary" className="w-full" onClick={() => setSelected(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
