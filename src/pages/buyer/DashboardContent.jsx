import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, Crown, Ticket, UserRound, Wrench, Zap } from "lucide-react";
import { getDashboardStats } from "../../services/profileService";
import { getTickets } from "../../services/ticketService";
import { getServiceRequests } from "../../services/serviceRequestService";
import Button from "../../components/shared/Button";
import Card from "../../components/shared/Card";
import Badge from "../../components/shared/Badge";
import EmptyState from "../../components/shared/EmptyState";

function StatCard({ icon: Icon, title, value, note, color, barColor, barWidth }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        {note && <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-400">{note}</span>}
      </div>
      <h3 className="mt-6 text-2xl font-extrabold md:text-3xl">{value}</h3>
      <p className="mt-1 text-sm text-slate-600">{title}</p>
      <div className="mt-5 h-1 rounded-full bg-slate-100">
        <div className={`h-1 rounded-full ${barColor}`} style={{ width: barWidth }} />
      </div>
    </Card>
  );
}

export default function DashboardContent() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => { if (res.success) setStats(res.data); })
      .catch(() => {});

    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([ticketRes, requestRes]) => {
      const items = [];
      if (ticketRes.success && ticketRes.data) {
        ticketRes.data.slice(0, 5).forEach((t) => {
          items.push({ text: t.ticket_type, time: formatTimeAgo(t.created_at), status: t.status, icon: Ticket, color: "orange" });
        });
      }
      if (requestRes.success && requestRes.data) {
        requestRes.data.slice(0, 5).forEach((r) => {
          items.push({ text: r.service_type, time: formatTimeAgo(r.created_at), status: r.status, icon: Wrench, color: "blue" });
        });
      }
      setActivities(items.sort((a, b) => 0).slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 md:space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 md:mt-2">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Button iconLeft={Zap} onClick={() => navigate("/premium")} className="w-full sm:w-auto">
          Upgrade to Premium
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={Wrench} title="Service Requests" value={stats ? String(stats.totalServiceRequests) : "0"} note="All time" color="bg-blue-50 text-blue-600" barColor="bg-blue-500" barWidth="75%" />
        <StatCard icon={Ticket} title="Support Tickets" value={stats ? String(stats.totalTickets) : "0"} note={stats ? `${stats.pendingTickets} pending` : ""} color="bg-orange-50 text-orange-500" barColor="bg-orange-400" barWidth="76%" />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        {/* Quick Actions */}
        <Card>
          <h2 className="mb-5 text-xl font-extrabold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wrench, label: "Service", color: "border-blue-200 bg-blue-50 text-blue-500", to: "/installation" },
              { icon: Ticket, label: "Ticket", color: "border-orange-200 bg-orange-50 text-orange-500", to: "/ticket" },
              { icon: Crown, label: "Premium", color: "border-orange-200 bg-orange-50 text-orange-500", to: "/premium" },
              { icon: UserRound, label: "Profile", color: "border-blue-200 bg-blue-50 text-blue-500", to: "/profile" },
            ].map(({ icon: Icon, label, color, to }) => (
              <button key={label} type="button" onClick={() => navigate(to)}
                className={`flex items-center justify-between rounded-2xl border p-3 text-left transition hover:scale-[1.02] ${color}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><Icon className="h-5 w-5" /></div>
                  <span className="text-sm font-bold text-slate-900">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Recent Activity</h2>
            <button type="button" onClick={() => navigate("/recent")} className="flex items-center gap-1 text-sm font-semibold text-blue-600">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : activities.length === 0 ? (
            <EmptyState icon={Clock3} title="No activity yet" message="Your recent tickets and requests will appear here." />
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} onClick={() => navigate("/recent")}
                    className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.status === "Finished" ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-sm">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                    <Badge>{a.status || "Pending"}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Premium CTA */}
      <div className="flex flex-col gap-4 rounded-2xl bg-[#10254A] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold md:text-xl">Upgrade to SureServe Premium</h2>
          <p className="mt-1 text-sm text-sky-200 md:mt-2">Get priority service, extended warranties, and 24/7 dedicated support.</p>
        </div>
        <Button iconLeft={Zap} onClick={() => navigate("/premium")} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
          Explore Plans
        </Button>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMin = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
