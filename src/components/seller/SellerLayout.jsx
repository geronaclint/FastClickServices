import { useState } from "react";
import SellerSidebar from "./SellerSidebar";
import SellerTopbar from "./SellerTopbar";
import SellerDashboardPage from "../../pages/seller/SellerDashboardPage";
import TablePage from "../../pages/seller/TablePage";
import AnalyticsPage from "../../pages/seller/AnalyticsPage";
import AdvancedSubscription from "./AdvancedSubscription";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Shell — layout wrapper for all seller pages.
 */
function Shell({ page, children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("sellerDarkMode") === "true");

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => { const next = !prev; localStorage.setItem("sellerDarkMode", String(next)); return next; });
  };

  return (
    <div className={isDarkMode ? "dark-mode min-h-screen" : "min-h-screen"}>
      <SellerSidebar page={page} />
      <SellerTopbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className={`min-h-screen pt-[66px] transition lg:pl-[245px] ${isDarkMode ? "bg-slate-950 text-white" : "bg-[#fff7f4] text-slate-950"}`}>
        <div className="p-4 sm:p-6 lg:p-7">{children}</div>
      </main>
    </div>
  );
}

export default function SellerPortal({ page }) {
  const { user } = useAuth();
  if (page === "requests") return <Shell page={page}><TablePage type="requests" /></Shell>;
  if (page === "tickets") return <Shell page={page}><TablePage type="tickets" /></Shell>;
  if (page === "analytics") return <Shell page={page}><AnalyticsPage /></Shell>;
  if (page === "subscription") return <Shell page={page}><AdvancedSubscription user={user} onUpgrade={() => window.location.reload()} /></Shell>;
  return <Shell page="dashboard"><SellerDashboardPage /></Shell>;
}
