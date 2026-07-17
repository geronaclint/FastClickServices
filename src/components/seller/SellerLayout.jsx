import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import SellerSidebar from "./SellerSidebar";
import SellerTopbar from "./SellerTopbar";
import SellerNotificationDropdown from "./SellerNotificationDropdown";
import SellerDashboardPage from "../../pages/seller/SellerDashboardPage";
import TablePage from "../../pages/seller/TablePage";
import AnalyticsPage from "../../pages/seller/AnalyticsPage";
import AdvancedSubscription from "./AdvancedSubscription";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Shell — layout wrapper for all seller pages.
 * Renders sidebar + topbar + page content.
 * Kept as a thin wrapper importing the extracted components.
 */
function Shell({ page, children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("sellerDarkMode") === "true";
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("sellerDarkMode", String(next));
      return next;
    });
  };

  return (
    <div className={isDarkMode ? "dark-mode min-h-screen" : "min-h-screen"}>
      <SellerSidebar page={page} />

      <SellerTopbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main
        className={`min-h-screen pl-[245px] pt-[66px] transition ${
          isDarkMode ? "bg-slate-950 text-white" : "bg-[#fff7f4] text-slate-950"
        }`}
      >
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}

/**
 * SellerPortal — routes to the correct page component based on the `page` prop.
 * This is the default export and is used by SellerShell.jsx during the migration.
 */
export default function SellerPortal({ page }) {
  const { user } = useAuth();

  if (page === "requests") return <Shell page={page}><TablePage type="requests" /></Shell>;
  if (page === "tickets") return <Shell page={page}><TablePage type="tickets" /></Shell>;
  if (page === "analytics") return <Shell page={page}><AnalyticsPage /></Shell>;
  if (page === "subscription") {
    return (
      <Shell page={page}>
        <AdvancedSubscription
          user={user}
          onUpgrade={(plan) => {
            // updateUserLocal is called by the context; reload to reflect
            window.location.reload();
          }}
        />
      </Shell>
    );
  }

  return <Shell page="dashboard"><SellerDashboardPage /></Shell>;
}
