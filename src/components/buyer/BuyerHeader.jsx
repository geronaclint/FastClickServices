import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Crown, Zap, Clock3, CheckCircle2 } from "lucide-react";
import { getTickets } from "../../services/ticketService";
import { getServiceRequests } from "../../services/serviceRequestService";

const subscriptionIcons = {
  Professional: { Icon: Zap, color: "text-blue-500", bg: "bg-blue-100" },
  Enterprise: { Icon: Crown, color: "text-amber-500", bg: "bg-amber-100" },
};

function formatTimeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BuyerHeader({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const name = user?.fullName || "User";
  const subscription = user?.subscription || "Free";
  const photo = user?.photo || localStorage.getItem(`profilePhoto_${user?.id || "default"}`) || "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const subInfo = subscriptionIcons[subscription];

  useEffect(() => {
    // Fetch notifications
    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([ticketRes, requestRes]) => {
      const items = [];
      if (ticketRes.success && ticketRes.data) {
        ticketRes.data.forEach((t) => items.push({ ...t, title: `Ticket #${t.id} - ${t.status}` }));
      }
      if (requestRes.success && requestRes.data) {
        requestRes.data.forEach((r) => items.push({ ...r, title: `Service #${r.id} - ${r.status}` }));
      }
      const sorted = items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
      setNotifications(sorted);
    });

    // Outside click handler
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate("/recent");
  };

  return (
    <header
      className={`flex h-[70px] items-center justify-between border-b px-8 transition ${
        isDarkMode
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className={isDarkMode ? "text-slate-300" : "text-slate-500"}>
          Welcome back,{" "}
          <span className={isDarkMode ? "font-bold text-white" : "font-bold text-slate-950"}>
            {name}
          </span>
        </p>
        {subInfo && (
          <span className={`ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${subInfo.bg} ${subInfo.color}`}>
            <subInfo.Icon className="h-3 w-3" />
            {subscription}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative rounded-full p-2 transition ${isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"}`}
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500" />}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 top-12 z-50 w-80 rounded-2xl shadow-xl ring-1 ${isDarkMode ? "bg-slate-800 ring-slate-700" : "bg-white ring-slate-200"}`}>
              <div className={`border-b px-5 py-4 font-extrabold ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
                Notifications
              </div>
              <div className="max-h-[320px] overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      onClick={handleNotificationClick}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 transition ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
                    >
                      {n.status === "Finished" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      )}
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{n.title}</p>
                        <p className="text-xs text-slate-500">{formatTimeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {photo ? (
          <img src={photo} alt="" className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
