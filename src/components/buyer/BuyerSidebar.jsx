import { NavLink, useNavigate } from "react-router-dom";
import {
  Bolt,
  LayoutDashboard,
  Wrench,
  Ticket,
  ClipboardList,
  Crown,
  UserRound,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { key: "installation", label: "Service Request", icon: Wrench, path: "/installation" },
  { key: "ticket", label: "Submit Support Ticket", icon: Ticket, path: "/ticket" },
  { key: "recent", label: "Recent Tickets & Support", icon: ClipboardList, path: "/recent" },
  { key: "premium", label: "SureServe Premium", icon: Crown, badge: "PRO", path: "/premium" },
  { key: "profile", label: "Profile", icon: UserRound, path: "/profile" },
];

const subscriptionIcons = {
  Professional: { Icon: Zap, color: "text-blue-400", bg: "bg-blue-500/20" },
  Enterprise: { Icon: Crown, color: "text-amber-400", bg: "bg-amber-500/20" },
};

export default function BuyerSidebar({ user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.fullName || "User";
  const email = user?.email || "";
  const subscription = user?.subscription || "Free";
  const photo = user?.photo || localStorage.getItem(`profilePhoto_${user?.id || "default"}`) || "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const subInfo = subscriptionIcons[subscription];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-[#0B1B34] text-white">
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <Bolt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide">SURE SERVE</h1>
            <p className="text-xs text-sky-300">Buyer Portal</p>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-white/10 py-5">
        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt=""
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white/20"
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold">{name}</p>
              {subInfo && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-md ${subInfo.bg}`}>
                  <subInfo.Icon className={`h-3 w-3 ${subInfo.color}`} />
                </span>
              )}
            </div>
            <p className="truncate text-xs text-sky-300">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                      isActive
                        ? "border border-blue-500 bg-blue-600/25 text-white"
                        : "text-sky-200 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-6 w-6" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-orange-600/70 px-2 py-0.5 text-xs text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-4 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-base font-bold text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-6 w-6" />
          Logout
        </button>
      </div>
    </aside>
  );
}
