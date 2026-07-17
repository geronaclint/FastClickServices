import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getTickets } from "../../services/ticketService";
import { getServiceRequests } from "../../services/serviceRequestService";

export default function SellerNotificationDropdown({ isDarkMode }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([ticketRes, requestRes]) => {
      const arr = [];
      if (ticketRes.success)
        ticketRes.data.forEach((t) =>
          arr.push({ ...t, title: `New Ticket #${t.id} - ${t.ticket_type}`, notifType: "ticket" })
        );
      if (requestRes.success)
        requestRes.data.forEach((r) =>
          arr.push({ ...r, title: `New Request #${r.id} - ${r.service_type}`, notifType: "request" })
        );
      setItems(
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      );
    });
  }, []);

  const handleClick = (item) => {
    setShow(false);
    if (item.notifType === "ticket") {
      navigate(`/seller-tickets#${item.id}`);
    } else {
      navigate(`/seller-requests#${item.id}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative text-orange-500"
      >
        <Bell size={19} />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </button>

      {show && (
        <div
          className={`absolute right-0 top-10 z-50 w-80 rounded-2xl shadow-xl ring-1 ${
            isDarkMode ? "bg-slate-800 ring-slate-700" : "bg-white ring-slate-200"
          }`}
        >
          <div className="border-b border-slate-100 p-4 font-bold">Recent Updates</div>
          <div className="p-2">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.title}`}
                onClick={() => handleClick(item)}
                className={`cursor-pointer rounded-xl p-3 text-sm ${
                  isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"
                }`}
              >
                <p className="font-bold">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
