import { Outlet, useLocation } from "react-router-dom";
import SellerPortal from "./SellerLayout";

export default function SellerShell() {
  const location = useLocation();
  const path = location.pathname;

  const sellerPageMap = {
    "/seller-dashboard": "dashboard",
    "/seller-requests": "requests",
    "/seller-tickets": "tickets",
    "/seller-analytics": "analytics",
    "/seller-subscription": "subscription",
  };

  const page = sellerPageMap[path] || "dashboard";

  // SellerPortal handles all seller pages internally for now
  // (it will be split in Phase 1.3)
  return (
    <>
      <SellerPortal page={page} />
      {/* Outlet unused until SellerLayout split is complete */}
      <div style={{ display: "none" }}>
        <Outlet />
      </div>
    </>
  );
}
