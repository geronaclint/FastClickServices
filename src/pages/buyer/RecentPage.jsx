import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Eye,
  Filter,
  MoreVertical,
  Search,
  Star,
  Trash2,
  X,
  Wrench,
  Ticket,
  Monitor,
  HardDrive,
  Bug,
  ShieldCheck,
  Settings,
  Cpu,
  Hammer,
  AlertTriangle,
} from "lucide-react";
import { getTickets, deleteTicket as apiDeleteTicket } from "../../services/ticketService";
import { getServiceRequests, deleteServiceRequest as apiDeleteServiceRequest } from "../../services/serviceRequestService";
import { submitRating, getRating } from "../../services/ratingService";

const typeIconMap = {
  "Technical Support": Monitor,
  "Hardware Malfunction": HardDrive,
  "Software Error": Bug,
  "Warranty Claim": ShieldCheck,
  "Installation": Settings,
  "Maintenance": Wrench,
  "Repair": Hammer,
};

function getTypeIcon(type) {
  return typeIconMap[type] || Cpu;
}

function badgeClass(kind, value) {
  const map = {
    status: {
      Processing: "bg-orange-50 text-orange-500",
      Pending: "bg-blue-50 text-blue-500",
      Finished: "bg-emerald-50 text-emerald-500",
      Cancelled: "bg-red-50 text-red-500",
    },
    priority: {
      Normal: "bg-blue-50 text-blue-600",
      High: "bg-orange-50 text-orange-500",
      Urgent: "bg-red-50 text-red-500",
      Low: "bg-slate-100 text-slate-500",
    },
  };

  return (map[kind] && map[kind][value]) || "bg-slate-100 text-slate-500";
}

function priorityDotColor(priority) {
  const map = {
    Low: "bg-slate-400",
    Normal: "bg-blue-500",
    High: "bg-orange-500",
    Urgent: "bg-red-500",
  };
  return map[priority] || "bg-slate-400";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ────────────────────────────────────────────
   Confirmation Modal (blur background)
   ──────────────────────────────────────────── */
function ConfirmModal({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  if (!open) return null;

  const btnColor =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 font-bold text-white transition ${btnColor}`}
          >
            {confirmLabel || "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Star Rating (locked after submit)
   ──────────────────────────────────────────── */
function StarRating({ rating, onRate, locked }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={locked}
          onClick={() => !locked && onRate(star)}
          onMouseEnter={() => !locked && setHover(star)}
          onMouseLeave={() => !locked && setHover(0)}
          className={`transition ${locked ? "cursor-default" : "hover:scale-110"}`}
        >
          <Star
            className={`h-6 w-6 transition ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-300"
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-600">{rating}/5</span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Ticket Details Modal (with rating)
   ──────────────────────────────────────────── */
function TicketDetailsModal({ ticket, onClose }) {
  if (!ticket) return null;

  const isFinished = ticket.status === "Finished";
  const ratingKey = `rating_${ticket.source}_${ticket.id}`;
  const reviewKey = `review_${ticket.source}_${ticket.id}`;
  const lockedKey = `ratingLocked_${ticket.source}_${ticket.id}`;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [locked, setLocked] = useState(false);
  const [showRatingConfirm, setShowRatingConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isFinished) {
      getRating(ticket.source, ticket.id)
        .then((res) => {
          if (res.success && res.data) {
            setRating(res.data.rating);
            setReviewText(res.data.review || "");
            setLocked(true);
            
            // Also store in localStorage for the table view's quick check
            localStorage.setItem(`rating_${ticket.source}_${ticket.id}`, String(res.data.rating));
          }
        })
        .catch(() => {});
    }
  }, [ticket, isFinished]);

  const handleRate = (stars) => {
    if (locked) return;
    setRating(stars);
  };

  const handleSubmitRating = () => {
    if (rating === 0) return;
    setShowRatingConfirm(true);
  };

  const confirmSubmitRating = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitRating(ticket.source, ticket.id, rating, reviewText);
      if (res.success) {
        localStorage.setItem(`rating_${ticket.source}_${ticket.id}`, String(rating));
        setLocked(true);
        setShowRatingConfirm(false);
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const TypeIcon = getTypeIcon(ticket.itemType);
  const SourceIcon = ticket.source === "ticket" ? Ticket : Wrench;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SourceIcon className={`h-4 w-4 ${ticket.source === "ticket" ? "text-orange-500" : "text-blue-500"}`} />
              <p className="text-sm font-bold text-blue-600">#{ticket.id}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ticket.source === "ticket" ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}`}>
                {ticket.source === "ticket" ? "Support Ticket" : "Service Request"}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold">Details</h2>
            <p className="text-sm text-slate-500">Submitted on {formatDate(ticket.created_at)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-slate-400">{ticket.source === "ticket" ? "Ticket Type" : "Service Type"}</p>
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-slate-500" />
              <p className="font-bold text-slate-900">{ticket.itemType}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400">Description</p>
            <div className="max-h-[120px] overflow-y-auto rounded-lg bg-slate-50 p-3">
              <p className="break-words font-semibold text-slate-700">{ticket.description || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">Status</p>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeClass("status", ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <div>
              <p className="text-slate-400">Priority</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeClass("priority", ticket.priority)}`}>
                <span className={`h-2 w-2 rounded-full ${priorityDotColor(ticket.priority)}`} />
                {ticket.priority}
              </span>
            </div>
            {ticket.preferred_date && (
              <div>
                <p className="text-slate-400">Preferred Date</p>
                <p className="font-bold text-slate-900">{formatDate(ticket.preferred_date)} {ticket.preferred_time || ""}</p>
              </div>
            )}
          </div>

          {/* Star Rating for Finished tickets */}
          {isFinished && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-bold text-amber-700">
                {locked ? "Your Rating" : "Rate this service"}
              </p>
              <StarRating rating={rating} onRate={handleRate} locked={locked} />

              {/* Optional review text box */}
              {!locked && (
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write an optional review..."
                  className="mt-3 w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  rows={2}
                />
              )}

              {locked && reviewText && (
                <p className="mt-2 text-sm italic text-amber-700">"{reviewText}"</p>
              )}

              {locked && (
                <p className="mt-2 text-xs text-amber-600">
                  Rating submitted. This rating cannot be edited.
                </p>
              )}

              {!locked && rating > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitRating}
                  disabled={isSubmitting}
                  className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Rating"}
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Close
        </button>
      </div>

      {/* Confirmation: ratings are permanent */}
      <ConfirmModal
        open={showRatingConfirm}
        title="Submit Rating?"
        message="Once submitted, your rating and review cannot be edited. Are you sure?"
        confirmLabel="Submit"
        confirmColor="green"
        onConfirm={confirmSubmitRating}
        onCancel={() => setShowRatingConfirm(false)}
      />
    </div>
  );
}

export default function RecentPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAll();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ticketRes, requestRes] = await Promise.all([
        getTickets().catch(() => ({ success: false, data: [] })),
        getServiceRequests().catch(() => ({ success: false, data: [] })),
      ]);
      if (ticketRes.success) setTickets(ticketRes.data);
      if (requestRes.success) setServiceRequests(requestRes.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const allItems = useMemo(() => {
    const ticketItems = tickets.map((t) => ({
      ...t,
      source: "ticket",
      itemType: t.ticket_type,
    }));
    const requestItems = serviceRequests.map((r) => ({
      ...r,
      source: "service",
      itemType: r.service_type,
    }));
    return [...ticketItems, ...requestItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [tickets, serviceRequests]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const searchable = `#${item.id} ${item.itemType} ${item.description || ""} ${item.status} ${item.priority}`.toLowerCase();
      const matchesSearch = searchable.includes(search.toLowerCase());
      const matchesStatus = status === "All Status" || item.status === status;
      const matchesSource =
        sourceFilter === "All" ||
        (sourceFilter === "Tickets" && item.source === "ticket") ||
        (sourceFilter === "Services" && item.source === "service");
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [allItems, search, status, sourceFilter]);

  const handleDelete = async (item) => {
    try {
      let res;
      if (item.source === "ticket") {
        res = await apiDeleteTicket(item.id);
        if (res.success) {
          setTickets((prev) => prev.filter((t) => t.id !== item.id));
        }
      } else {
        res = await apiDeleteServiceRequest(item.id);
        if (res.success) {
          setServiceRequests((prev) => prev.filter((r) => r.id !== item.id));
        }
      }
    } catch {
      // silent fail
    }
    setOpenMenu(null);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Recent Tickets & Support</h1>
            <p className="text-slate-500">View and manage all your tickets and service requests</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/ticket")}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            <Ticket className="h-4 w-4" />
            New Ticket
          </button>
          <button
            type="button"
            onClick={() => navigate("/installation")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            <Wrench className="h-4 w-4" />
            New Service
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex gap-4 border-b border-slate-100 p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, type, or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400" />

            {/* Source filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option>All</option>
              <option>Tickets</option>
              <option>Services</option>
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option>All Status</option>
              <option>Processing</option>
              <option>Pending</option>
              <option>Finished</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No tickets or requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">ID</th>
                  <th className="px-6 py-4 text-left font-bold">Source</th>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Priority</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const TypeIcon = getTypeIcon(item.itemType);
                  const SourceIcon = item.source === "ticket" ? Ticket : Wrench;
                  const uniqueKey = `${item.source}-${item.id}`;
                  const isFinished = item.status === "Finished";
                  const ratingKey = `rating_${item.source}_${item.id}`;
                  const savedRating = localStorage.getItem(ratingKey);

                  return (
                    <tr key={uniqueKey} className="border-b border-slate-100">
                      <td className="px-6 py-5 font-bold text-blue-600">#{item.id}</td>

                      {/* Source icon */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.source === "ticket"
                            ? "bg-orange-50 text-orange-500"
                            : "bg-blue-50 text-blue-500"
                        }`}>
                          <SourceIcon className="h-3.5 w-3.5" />
                          {item.source === "ticket" ? "Ticket" : "Service"}
                        </span>
                      </td>

                      {/* Type with icon */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                          <div className="min-w-0">
                            <p className="font-bold">{item.itemType}</p>
                            <p className="mt-1 max-w-[180px] truncate text-sm text-slate-400" title={item.description || ""}>
                              {item.description || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass("status", item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Priority with color dot */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeClass("priority", item.priority)}`}>
                          <span className={`h-2 w-2 rounded-full ${priorityDotColor(item.priority)}`} />
                          {item.priority}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-600">{formatDate(item.created_at)}</td>

                      <td className="relative px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedTicket(item)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Rate (for finished items) */}
                          {isFinished && !savedRating && (
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(item)}
                              className="rounded-lg p-2 text-amber-500 transition hover:bg-amber-50"
                              title="Rate this service"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}

                          {/* Finished rating badge */}
                          {isFinished && savedRating && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {savedRating}/5
                            </span>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(item)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between p-5 text-slate-500">
          <p>Showing {filtered.length} of {allItems.length} items</p>
        </div>
      </section>

      <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Item?"
        message={`Are you sure you want to delete this ${deleteConfirm?.source === "ticket" ? "ticket" : "service request"}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        confirmColor="red"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
