import { useEffect, useState } from "react";
import AppAuth from "./AppAuth";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import SellerPortal from "./components/seller/SellerLayout";
import { isSellerLoggedIn } from "./utils/sellerAuth";
import { getUser, clearAuthData } from "./services/authService";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = getUser();
    if (saved && saved.role === "buyer") {
      setIsLoggedIn(true);
      setUser(saved);
    }
  }, []);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  const sellerPageMap = {
    "/seller-dashboard": "dashboard",
    "/seller-requests": "requests",
    "/seller-tickets": "tickets",
    "/seller-analytics": "analytics",
    "/seller-subscription": "subscription",
  };

  if (path === "/seller-login") {
    return <AppAuth portalType="seller" />;
  }

  if (sellerPageMap[path]) {
    if (!isSellerLoggedIn()) {
      window.history.replaceState({}, "", "/seller-login");
      return <AppAuth portalType="seller" />;
    }
    return <SellerPortal page={sellerPageMap[path]} />;
  }

  const handleLogin = (loggedInUser) => {
    setIsLoggedIn(true);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    clearAuthData();
  };

  return isLoggedIn ? (
    <BuyerDashboard onLogout={handleLogout} user={user} />
  ) : (
    <AppAuth onLogin={handleLogin} />
  );
}
