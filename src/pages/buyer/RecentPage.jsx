import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Eye, Search, Star, Trash2, Ticket, Wrench, Monitor, HardDrive, Bug, ShieldCheck, Settings, Hammer, Cpu } from "lucide-react";
import { getTickets, deleteTicket as apiDeleteTicket } from "../../services/ticketService";
import { getServiceRequests, deleteServiceRequest as apiDeleteServiceRequest } from "../../services/serviceRequestService";
import { submitRating, getRating } from "../../services/ratingService";
import Button from "../../components/shared/Button";
import Badge from "../../components/shared/Badge";
import Table from "../../components/shared/Table";
import Modal from "../../components/shared/Modal";
import EmptyState from "../../components/shared/EmptyState";

const typeIconMap = { "Technical Support": Monitor, "Hardware Malfunction": HardDrive, "Software Error": Bug, "Warranty Claim": ShieldCheck, "Installation": Settings, "Maintenance": Wrench, "Repair": Hammer };

function confirmModal({ title, msg, onConfirm, confirmColor }) {
  return window.confirm(`${title}\n\n${msg}`) ? onConfirm() : null;
}

export default function RecentPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const [starReview, setStarReview] = useState("");
  const [starLocked, setStarLocked] = useState(false);
  const [starSubmitting, setStarSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([tRes, rRes]) => {
      if (tRes.success) setTickets(tRes.data);
      if (rRes.success) setServiceRequests(rRes.data);
      setLoading(false);
    });

    const interval = setInterval(() => {
      Promise.all([
        getTickets().catch(() => ({ success: false, data: [] })),
        getServiceRequests().catch(() => ({ success: false, data: [] })),
      ]).then(([tRes, rRes]) => {
        if (tRes.success) setTickets(tRes.data);
        if (rRes.success) setServiceRequests(rRes.data);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allItems = useMemo(() => {
    const tItems = tickets.map((t) => ({ ...t, source: "ticket", itemType: t.ticket_type }));
    const rItems = serviceRequests.map((r) => ({ ...r, source: "service", itemType: r.service_type }));
    return [...tItems, ...rItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tickets, serviceRequests]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const searchable = `#${item.id} ${item.itemType} ${item.description || ""} ${item.status} ${item.priority}`.toLowerCase();
      const ms = searchable.includes(search.toLowerCase());
      const mStatus = status === "All Status" || item.status === status;
      const mSource = sourceFilter === "All" || (sourceFilter === "Tickets" && item.source === "ticket") || (sourceFilter === "Services" && item.source === "service");
      return ms && mStatus && mSource;
    });
  }, [allItems, search, status, sourceFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * limit, page * limit), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / limit);

  useEffect(() => { setPage(1); }, [search, status, sourceFilter]);

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (selectedItem.source === "ticket") {
        const res = await apiDeleteTicket(selectedItem.id);
        if (res.success) setTickets((prev) => prev.filter((t) => t.id !== selectedItem.id));
      } else {
        const res = await apiDeleteServiceRequest(selectedItem.id);
        if (res.success) setServiceRequests((prev) => prev.filter((r) => r.id !== selectedItem.id));
      }
    } catch {}
    setSelectedItem(null);
  };

  const openRating = (item) => {
    setSelectedItem(item);
    setStarModalOpen(true);
    getRating(item.source, item.id).then((res) => {
      if (res.success && res.data) {
        setStarRating(res.data.rating);
        setStarReview(res.data.review || "");
        setStarLocked(true);
      } else { setStarRating(0); setStarReview(""); setStarLocked(false); }
    }).catch(() => {});
  };

  const submitStarRating = async () => {
    if (!selectedItem || starRating === 0) return;
    setStarSubmitting(true);
    try {
      const res = await submitRating(selectedItem.source, selectedItem.id, starRating, starReview);
      if (res.success) {
        localStorage.setItem(`rating_${selectedItem.source}_${selectedItem.id}`, String(starRating));
        setStarLocked(true);
        setStarModalOpen(false);
      }
    } catch {}
    setStarSubmitting(false);
  };

  const columns = [
    { key: "id", label: "ID", render: (r) => <span className="font-bold text-blue-600">#{r.id}</span> },
    { key: "source", label: "Source", render: (r) => {
      const Icon = r.source === "ticket" ? Ticket : Wrench;
      return <Badge className={r.source === "ticket" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}><Icon className="mr-1 inline h-3 w-3" />{r.source === "ticket" ? "Ticket" : "Service"}</Badge>;
    }},
    { key: "itemType", label: "Type", render: (r) => {
      const I = typeIconMap[r.itemType] || Cpu;
      return <div className="flex items-center gap-2"><I className="h-4 w-4 text-slate-400" /><span className="font-bold">{r.itemType}</span></div>;
    }},
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "priority", label: "Priority", render: (r) => <Badge variant="priority">{r.priority}</Badge> },
    { key: "created_at", label: "Date", render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "" },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex items-center gap-1">
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedItem(r); }} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
        {r.status === "Finished" && !localStorage.getItem(`rating_${r.source}_${r.id}`) && (
          <button type="button" onClick={(e) => { e.stopPropagation(); openRating(r); }} className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50"><Star className="h-4 w-4" /></button>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedItem(r); if (window.confirm("Delete this item?")) { if (r.source === "ticket") apiDeleteTicket(r.id).then((res) => res.success && setTickets((p) => p.filter((t) => t.id !== r.id))); else apiDeleteServiceRequest(r.id).then((res) => res.success && setServiceRequests((p) => p.filter((s) => s.id !== r.id))); setSelectedItem(null); } }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 md:h-14 md:w-14"><ClipboardList className="h-6 w-6 md:h-7 md:w-7" /></div>
          <div><h1 className="text-2xl font-extrabold md:text-3xl">Recent Tickets & Support</h1><p className="text-sm text-slate-500">View and manage all your tickets and service requests</p></div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600" iconLeft={Ticket} onClick={() => navigate("/ticket")}>New Ticket</Button>
          <Button size="sm" iconLeft={Wrench} onClick={() => navigate("/installation")}>New Service</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, type, or description..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="flex gap-2">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
            <option>All</option><option>Tickets</option><option>Services</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
            <option>All Status</option><option>Processing</option><option>Pending</option><option>Finished</option><option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={paginated} loading={loading} emptyState={{ icon: ClipboardList, title: "No tickets or requests found", message: search || status !== "All Status" || sourceFilter !== "All" ? "Try adjusting your filters." : "Submit a ticket or service request to get started." }}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onRowClick={(r) => setSelectedItem(r)} />

      {/* Detail Modal */}
      <Modal open={!!selectedItem && !starModalOpen} onClose={() => setSelectedItem(null)} title={selectedItem?.source === "ticket" ? "Ticket Details" : "Request Details"}>
        {selectedItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-slate-400">Type</p><p className="font-bold">{selectedItem.itemType}</p></div>
              <div><p className="text-slate-400">Status</p><Badge>{selectedItem.status}</Badge></div>
              <div><p className="text-slate-400">Priority</p><Badge variant="priority">{selectedItem.priority}</Badge></div>
              <div><p className="text-slate-400">Date</p><p className="font-bold">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : "—"}</p></div>
            </div>
            <div><p className="text-slate-400">Description</p><p className="mt-1 rounded-lg bg-slate-50 p-3 font-semibold">{selectedItem.description || "—"}</p></div>
            {selectedItem.status === "Finished" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-bold text-amber-700">
                  {localStorage.getItem(`rating_${selectedItem.source}_${selectedItem.id}`) ? `Your Rating: ${localStorage.getItem(`rating_${selectedItem.source}_${selectedItem.id}`)}/5` : "Rate this service"}
                </p>
                {!localStorage.getItem(`rating_${selectedItem.source}_${selectedItem.id}`) && (
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => openRating(selectedItem)}>Rate Now</Button>
                )}
              </div>
            )}
            <Button variant="primary" className="w-full" onClick={() => setSelectedItem(null)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal open={starModalOpen} onClose={() => setStarModalOpen(false)} title="Rate This Service" size="sm">
        <div className="space-y-4">
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <button key={s} type="button" disabled={starLocked} onClick={() => setStarRating(s)}
                className={`rounded-lg p-1 transition ${starLocked ? "cursor-default" : "hover:scale-110"}`}>
                <Star className={`h-8 w-8 ${s <= starRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          {!starLocked && (
            <textarea value={starReview} onChange={(e) => setStarReview(e.target.value)} placeholder="Write an optional review..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400" rows={2} />
          )}
          {starLocked && starReview && <p className="text-center text-sm italic text-amber-700">"{starReview}"</p>}
          {starLocked && <p className="text-center text-xs text-amber-600">Rating submitted and cannot be edited.</p>}
          {!starLocked && starRating > 0 && (
            <Button className="w-full bg-amber-500 hover:bg-amber-600" loading={starSubmitting} onClick={submitStarRating}>Submit Rating</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
