import { useEffect, useState } from "react";
import { XCircle, Star } from "lucide-react";
import { getRating } from "../../../services/ratingService";
import Badge from "./Badge";

export default function DetailsModal({ item, isTicket, onClose }) {
  if (!item) return null;

  return <DetailsModalInner item={item} isTicket={isTicket} onClose={onClose} />;
}

function DetailsModalInner({ item, isTicket, onClose }) {
  const [ratingData, setRatingData] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    if (item.status === "Finished") {
      setLoadingRating(true);
      const source = isTicket ? "ticket" : "service";
      getRating(source, item.id)
        .then((res) => {
          if (res.success && res.data) {
            setRatingData(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingRating(false));
    }
  }, [item, isTicket]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-extrabold">
              {isTicket ? "Ticket Details" : "Request Details"}
            </h3>
            <p className="text-sm text-slate-500">
              #{item.id} — {item.customer_name || "Customer"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <XCircle size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Customer Name</p>
            <p className="font-bold text-slate-800">{item.customer_name || item.contact_person || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Customer Email</p>
            <p className="font-bold text-slate-800">{item.customer_email || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Phone Number</p>
            <p className="font-bold">{item.phone || item.contact_person_phone || item.customer_phone || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Address</p>
            <p className="font-bold">{item.customer_address || "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Premium Status</p>
            <Badge>{item.customer_subscription || "Free"}</Badge>
          </div>
          <div>
            <p className="text-slate-400">{isTicket ? "Ticket Type" : "Service Type"}</p>
            <p className="font-bold">{isTicket ? item.ticket_type : item.service_type}</p>
          </div>
          {!isTicket && (
            <div>
              <p className="text-slate-400">Location</p>
              <p className="font-bold">{item.location || "—"}</p>
            </div>
          )}
          <div>
            <p className="text-slate-400">Status</p>
            <Badge>{item.status}</Badge>
          </div>
          <div>
            <p className="text-slate-400">Priority</p>
            <Badge>{item.priority}</Badge>
          </div>
          {item.preferred_date && (
            <div>
              <p className="text-slate-400">Preferred Date</p>
              <p className="font-bold">
                {new Date(item.preferred_date).toLocaleDateString()} {item.preferred_time || ""}
              </p>
            </div>
          )}
          <div>
            <p className="text-slate-400">Submitted On</p>
            <p className="font-bold">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</p>
          </div>
        </div>

        <div className="mt-5 max-h-[150px] overflow-y-auto break-words rounded-xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            {isTicket ? "Ticket Description" : "Service Description"}
          </p>
          <p className="text-sm text-slate-700">{item.description || "No description provided."}</p>
        </div>

        {item.status === "Finished" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-bold text-amber-700">Customer Rating</p>
            {loadingRating ? (
              <p className="text-sm text-amber-600">Loading rating...</p>
            ) : ratingData ? (
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= ratingData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-none text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-amber-600">{ratingData.rating}/5</span>
                </div>
                {ratingData.review && (
                  <p className="mt-2 text-sm italic text-amber-700">"{ratingData.review}"</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-600">No rating submitted yet.</p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {item.status === "Pending" && (
            <button
              type="button"
              onClick={() => {
                if (item.onUpdateStatus) item.onUpdateStatus(item.id, "Processing");
                onClose();
              }}
              className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Mark as Processing
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
