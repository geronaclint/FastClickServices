import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Ticket, Star, TrendingUp, BarChart3 } from "lucide-react";
import { getSellerStats } from "../../services/profileService";
import { getTickets } from "../../services/ticketService";
import { getServiceRequests } from "../../services/serviceRequestService";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Badge from "../../components/shared/Badge";
import HeaderTitle from "../../components/seller/common/HeaderTitle";

function StatCard({ icon: Icon, title, value, note, color }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={22} /></div>
        <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-400">{note}</span>
      </div>
      <h3 className="mt-6 text-2xl font-extrabold md:text-3xl">{value}</h3>
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-5 h-1.5 rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-orange-300" /></div>
    </Card>
  );
}

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    getSellerStats().then((res) => { if (res.success) setStats(res.data); }).catch(() => {});
    Promise.all([getServiceRequests().catch(() => ({ success: false, data: [] })), getTickets().catch(() => ({ success: false, data: [] }))])
      .then(([reqRes, tickRes]) => {
        let combined = [];
        if (reqRes.success) combined = combined.concat(reqRes.data.map((r) => ({ ...r, type: "request" })));
        if (tickRes.success) combined = combined.concat(tickRes.data.map((t) => ({ ...t, type: "ticket" })));
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentActivity(combined.slice(0, 5));
      });
  }, []);

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Seller Dashboard</h2>
            <p className="text-sm text-slate-500">Monitor and manage your service operations.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/seller-requests")} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">View All Requests</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ListChecks} value={stats ? String(stats.totalRequests) : "0"} title="Total Requests" note="All time" color="bg-orange-50 text-orange-500" />
        <StatCard icon={Ticket} value={stats ? String(stats.totalTickets) : "0"} title="Active Tickets" note={stats ? `${stats.pendingTickets} pending` : ""} color="bg-blue-50 text-blue-500" />
        <StatCard icon={Star} value={stats && parseFloat(stats.avgRating) > 0 ? stats.avgRating : "0.0"} title="Customer Rating" note={stats ? `Based on ${stats.totalRatings} review${stats.totalRatings === 1 ? "" : "s"}` : "No reviews"} color="bg-amber-50 text-amber-500" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_390px]">
        <Card>
          <div className="mb-4 flex items-center justify-between border-b border-orange-100 pb-4">
            <h3 className="text-lg font-extrabold">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No activity yet.</div>
          ) : (
            recentActivity.map((item) => (
              <button key={`${item.type}-${item.id}`} type="button" onClick={() => navigate(item.type === "ticket" ? `/seller-tickets#${item.id}` : `/seller-requests#${item.id}`)}
                className="flex w-full flex-col gap-2 border-b border-slate-100 px-2 py-3 text-left transition-colors hover:bg-orange-50/50 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4">
                <span className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${item.type === "ticket" ? "bg-blue-50 text-blue-500" : "bg-orange-50 text-orange-500"}`}>#{item.id}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-bold text-sm">{item.customer_name || "Customer"}</p><p className="truncate text-xs text-slate-400">{item.type === "ticket" ? item.ticket_type : item.service_type}</p></div>
                <div className="flex gap-2"><Badge>{item.status}</Badge><Badge>{item.priority}</Badge></div>
                <span className="flex-shrink-0 text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </button>
            ))
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="mb-5 text-lg font-extrabold">Activity Status</h3>
            {[["Completed", (stats?.finishedRequests || 0) + (stats?.finishedTickets || 0), "bg-emerald-500"], ["In Progress", (stats?.processingRequests || 0) + (stats?.processingTickets || 0), "bg-orange-500"], ["Pending", (stats?.pendingRequests || 0) + (stats?.pendingTickets || 0), "bg-blue-500"], ["Cancelled", (stats?.cancelledRequests || 0), "bg-red-500"]].map(([label, value, color]) => {
              const total = Math.max((stats?.totalRequests || 0) + (stats?.totalTickets || 0), 1);
              return (
                <div className="mb-3" key={label}>
                  <div className="flex justify-between text-sm"><span>{label}</span><b className="text-xs">{value}</b></div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className={`${color} h-full rounded-full`} style={{ width: `${Math.round((value / total) * 100)}%` }} /></div>
                </div>
              );
            })}
          </Card>

          <Card>
            <h3 className="mb-5 text-lg font-extrabold">Quick Actions</h3>
            {[[ListChecks, "Manage Requests", "/seller-requests"], [Ticket, "View Tickets", "/seller-tickets"], [BarChart3, "Analytics", "/seller-analytics"]].map(([Icon, title, path]) => (
              <button key={title} type="button" onClick={() => navigate(path)} className="flex w-full items-center gap-4 py-4 font-semibold text-sm">
                <span className="rounded-xl bg-orange-50 p-2 text-orange-500"><Icon size={18} /></span>{title}<span className="ml-auto text-slate-300">→</span>
              </button>
            ))}
          </Card>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#351000] p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="rounded-xl bg-orange-500/20 p-3 text-orange-400 sm:p-4"><TrendingUp /></span>
            <div>
              <h3 className="text-lg font-extrabold">Performance Insight</h3>
              <p className="text-sm font-semibold text-orange-300">
                Your completion rate is {stats && (stats.totalRequests + stats.totalTickets) > 0 ? Math.round(((stats.finishedRequests + stats.finishedTickets) / (stats.totalRequests + stats.totalTickets)) * 100) : 0}% — keep it up!
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/seller-analytics")} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">View Analytics →</Button>
        </div>
      </div>
    </>
  );
}
