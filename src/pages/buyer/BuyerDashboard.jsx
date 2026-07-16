import { useState, useEffect } from "react";
import BuyerLayout from "../../components/buyer/BuyerLayout";
import DashboardContent from "./DashboardContent";
import InstallationPage from "./InstallationPage";
import TicketPage from "./TicketPage";
import RecentPage from "./RecentPage";
import PremiumPage from "./PremiumPage";
import ProfilePage from "./ProfilePage";
import { getUser, saveAuthData, getAuthToken } from "../../services/authService";

export default function BuyerDashboard({ onLogout, user: propUser }) {
  const [page, setPage] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("buyerDarkMode") === "true";
  });

  const savedUser = getUser();
  const [user, setUser] = useState(propUser || savedUser || { fullName: "User", email: "" });

  const handleDarkModeChange = (value) => {
    setIsDarkMode(value);
    localStorage.setItem("buyerDarkMode", String(value));
  };

  useEffect(() => {
    const handleNavigation = (e) => {
      if (e.detail) setPage(e.detail);
    };
    window.addEventListener("navigatePage", handleNavigation);
    return () => window.removeEventListener("navigatePage", handleNavigation);
  }, []);

  const handleUpgrade = (planName) => {
    const updated = { ...user, subscription: planName };
    setUser(updated);
    // Persist to localStorage
    saveAuthData({ token: getAuthToken(), user: updated });
  };

  const renderPage = () => {
    switch (page) {
      case "installation":
        return <InstallationPage setPage={setPage} />;
      case "ticket":
        return <TicketPage setPage={setPage} />;
      case "recent":
        return <RecentPage setPage={setPage} />;
      case "premium":
        return <PremiumPage user={user} onUpgrade={handleUpgrade} />;
      case "profile":
        return (
          <ProfilePage
            isDarkMode={isDarkMode}
            setIsDarkMode={handleDarkModeChange}
            user={user}
            onUpdateUser={setUser}
          />
        );
      default:
        return <DashboardContent setPage={setPage} />;
    }
  };

  return (
    <BuyerLayout
      currentPage={page}
      setPage={setPage}
      onLogout={onLogout}
      isDarkMode={isDarkMode}
      user={user}
    >
      {renderPage()}
    </BuyerLayout>
  );
}
