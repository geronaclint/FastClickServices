import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  Ticket,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";
import { getDashboardStats } from "../../services/profileService";
import { getTickets } from "../../services/ticketService";
import { getServiceRequests } from "../../services/serviceRequestService";

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-500",
  green: "bg-emerald-50 text-emerald-500",
  purple: "bg-violet-50 text-violet-500",
};

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorMap[item.color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-400">
          {item.note}
        </span>
      </div>

      <h3 className="mt-6 text-3xl font-extrabold">{item.value}</h3>
      <p className="mt-1 text-slate-600">{item.title}</p>
      <div className="mt-5 h-1 rounded-full bg-slate-100">
        <div className={`h-1 rounded-full ${item.bar}`} style={{ width: item.width }} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }) {
  const style =
    color === "orange"
      ? "border-orange-200 bg-orange-50 text-orange-500"
      : "border-blue-200 bg-blue-50 text-blue-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition hover:scale-[1.02] ${style}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-bold text-slate-900">{label}</span>
      </div>
    </button>
  );
}

export default function DashboardContent({ setPage }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    // Fetch real recent activities from tickets + service requests
    Promise.all([
      getTickets().catch(() => ({ success: false, data: [] })),
      getServiceRequests().catch(() => ({ success: false, data: [] })),
    ]).then(([ticketRes, requestRes]) => {
      const items = [];

      if (ticketRes.success && ticketRes.data) {
        ticketRes.data.forEach((t) => {
          items.push({
            text: `${t.ticket_type}`,
            time: t.created_at ? formatTimeAgo(t.created_at) : "",
            icon: t.status === "Finished" ? CheckCircle2 : Clock3,
            color: t.status === "Finished" ? "emerald" : "orange",
            sourceIcon: Ticket, // Type specific icon
            timestamp: new Date(t.created_at).getTime(),
          });
        });
      }

      if (requestRes.success && requestRes.data) {
        requestRes.data.forEach((r) => {
          items.push({
            text: `${r.service_type}`,
            time: r.created_at ? formatTimeAgo(r.created_at) : "",
            icon: r.status === "Finished" ? CheckCircle2 : Clock3,
            color: r.status === "Finished" ? "emerald" : "blue",
            sourceIcon: Wrench, // Type specific icon
            timestamp: new Date(r.created_at).getTime(),
          });
        });
      }

      // Sort by most recent first and take up to 4
      setActivities(items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4));
    });
  }, []);

  const statCards = [
    {
      title: "Service Requests",
      value: stats ? String(stats.totalServiceRequests) : "0",
      note: "All time",
      icon: Wrench,
      color: "blue",
      bar: "bg-blue-500",
      width: "75%",
    },
    {
      title: "Support Tickets",
      value: stats ? String(stats.totalTickets) : "0",
      note: stats ? `${stats.pendingTickets} pending` : "",
      icon: Ticket,
      color: "orange",
      bar: "bg-orange-400",
      width: "76%",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-500">
            Welcome back! Here's what's happening with your account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPage("premium")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Zap className="h-5 w-5" />
          Upgrade to Premium
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {statCards.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-extrabold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={Wrench}
              label="Service"
              color="blue"
              onClick={() => setPage("installation")}
            />
            <QuickAction
              icon={Ticket}
              label="Ticket"
              color="orange"
              onClick={() => setPage("ticket")}
            />
            <QuickAction
              icon={Crown}
              label="Premium"
              color="orange"
              onClick={() => setPage("premium")}
            />
            <QuickAction
              icon={UserRound}
              label="Edit Profile"
              color="blue"
              onClick={() => setPage("profile")}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Recent Activity</h2>
            <button
              type="button"
              onClick={() => setPage("recent")}
              className="flex items-center gap-1 font-semibold text-blue-600"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
              <Clock3 className="mx-auto mb-3 h-8 w-8" />
              <p className="font-semibold">No activity yet</p>
              <p className="mt-1 text-sm">Your recent tickets and requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                const SourceIcon = activity.sourceIcon;
                const circle =
                  activity.color === "orange"
                    ? "bg-orange-50 text-orange-500"
                    : activity.color === "blue"
                    ? "bg-blue-50 text-blue-500"
                    : "bg-emerald-50 text-emerald-500";

                return (
                  <div
                    key={idx}
                    onClick={() => setPage("recent")}
                    className="flex cursor-pointer items-center gap-5 rounded-2xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${circle}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                         <SourceIcon className={`h-3 w-3 ${activity.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400'}`} />
                         <p className="font-semibold">{activity.text}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="flex items-center justify-between rounded-2xl bg-[#10254A] p-6 text-white">
        <div>
          <h2 className="text-xl font-extrabold">Upgrade to SureServe Premium</h2>
          <p className="mt-2 text-sky-200">
            Get priority service, extended warranties, and 24/7 dedicated support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPage("premium")}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-4 font-bold transition hover:bg-orange-600"
        >
          <Zap className="h-5 w-5" />
          Explore Plans
        </button>
      </section>
    </div>
  );
}

function formatTimeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
