import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bolt, Grid2X2, ListChecks, Ticket, BarChart3, Star, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { logoutSeller } from "../../utils/sellerAuth";

export default function SellerSidebar({ page }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayUser = user || { fullName: "Seller", email: "seller@sureserve.com" };
  const initials = displayUser.fullName ? displayUser.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "S";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { const h = () => { if (window.innerWidth >= 1024) setMobileOpen(false); }; window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  const go = (path) => { navigate(path); setMobileOpen(false); };

  const item = (id, label, Icon, path) => (
    <button type="button" onClick={() => go(path)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${page === id ? "bg-orange-500/20 text-white ring-1 ring-orange-500" : "text-orange-100 hover:bg-white/10"}`}>
      <Icon size={17} />{label}<span className="ml-auto">›</span>
    </button>
  );

  const handleLogout = () => { if (window.confirm("Are you sure you want to log out?")) { logoutSeller(); navigate("/seller-login", { replace: true }); } };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500"><Bolt size={22} /></div>
        <div><h1 className="font-extrabold tracking-wide">SURE SERVE</h1><p className="text-xs font-bold text-orange-400">Seller Portal</p></div>
      </div>
      <div className="border-y border-white/10 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold">{initials}</div>
          <div><p className="max-w-[150px] truncate font-bold">{displayUser.fullName}</p><p className="max-w-[150px] truncate text-xs font-bold text-orange-400">{displayUser.email}</p></div>
        </div>
      </div>
      <nav className="mt-5 space-y-2">
        {item("dashboard", "Dashboard", Grid2X2, "/seller-dashboard")}
        {item("requests", "Manage Requests", ListChecks, "/seller-requests")}
        {item("tickets", "Manage Support Tickets", Ticket, "/seller-tickets")}
        {item("analytics", "Analytics", BarChart3, "/seller-analytics")}
        {item("subscription", "Subscription", Star, "/seller-subscription")}
      </nav>
      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-400"><LogOut size={16} />Logout</button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button type="button" onClick={() => setMobileOpen(true)} className="fixed left-3 top-3 z-50 rounded-xl bg-[#351000] p-2.5 text-white shadow-lg lg:hidden"><Menu className="h-5 w-5" /></button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto bg-[#351000] px-4 py-5 text-white">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 rounded-xl p-1 text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[245px] flex-col bg-[#351000] px-4 py-5 text-white lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
