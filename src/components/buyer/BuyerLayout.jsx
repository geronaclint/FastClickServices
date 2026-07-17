import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import BuyerHeader from "./BuyerHeader";
import BuyerSidebar from "./BuyerSidebar";

export default function BuyerLayout() {
  const { user } = useAuth();
  const { resolvedBuyer } = useTheme();
  const isDarkMode = resolvedBuyer === "dark";

  return (
    <div className={`min-h-screen transition ${isDarkMode ? "dark-mode bg-slate-950 text-white" : "bg-[#edf3ff] text-slate-950"}`}>
      <BuyerSidebar user={user} />
      {/* Content: offset by sidebar on desktop, full-width on mobile */}
      <div className="min-h-screen lg:ml-[260px]">
        <BuyerHeader isDarkMode={isDarkMode} user={user} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
