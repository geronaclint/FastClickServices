import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import BuyerLayout from "./components/buyer/BuyerLayout";
import SellerShell from "./components/seller/SellerShell";
import AppAuth from "./AppAuth";
import DashboardContent from "./pages/buyer/DashboardContent";
import InstallationPage from "./pages/buyer/InstallationPage";
import TicketPage from "./pages/buyer/TicketPage";
import RecentPage from "./pages/buyer/RecentPage";
import PremiumPage from "./pages/buyer/PremiumPage";
import ProfilePage from "./pages/buyer/ProfilePage";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef4ff]">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "buyer") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireSeller({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7f4]">
        <div className="text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== "provider" && user.role !== "admin" && user.role !== "seller")) {
    return <Navigate to="/seller-login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<AppAuth portalType="buyer" />} />
      <Route path="/seller-login" element={<AppAuth portalType="seller" />} />

      {/* Buyer protected routes */}
      <Route
        element={
          <RequireAuth>
            <BuyerLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="installation" element={<InstallationPage />} />
        <Route path="ticket" element={<TicketPage />} />
        <Route path="recent" element={<RecentPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Seller protected routes */}
      <Route
        element={
          <RequireSeller>
            <SellerShell />
          </RequireSeller>
        }
      >
        <Route path="seller-dashboard" element={<div />} />
        <Route path="seller-requests" element={<div />} />
        <Route path="seller-tickets" element={<div />} />
        <Route path="seller-analytics" element={<div />} />
        <Route path="seller-subscription" element={<div />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
