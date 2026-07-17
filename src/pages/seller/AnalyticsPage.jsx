import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Star,
  ListChecks,
  Ticket,
  TrendingUp,
  Lock,
  FileText,
} from "lucide-react";
import { getSellerStats } from "../../services/profileService";
import { getServiceRequests } from "../../services/serviceRequestService";
import { getTickets } from "../../services/ticketService";
import { useAuth } from "../../contexts/AuthContext";
import HeaderTitle from "../../components/seller/common/HeaderTitle";

export default function AnalyticsPage() {
  const { subscription } = useAuth();
  const sellerPlan = (subscription || "Free").toLowerCase();
  const isPremium = sellerPlan === "professional" || sellerPlan === "enterprise";

  const [stats, setStats] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [ticketTypeData, setTicketTypeData] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  useEffect(() => {
    if (!isPremium) return;

    getSellerStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    getServiceRequests()
      .then((res) => {
        if (res.success) {
          setAllRequests(res.data);
          const counts = {};
          res.data.forEach((req) => {
            const type = req.service_type || "Other";
            counts[type] = (counts[type] || 0) + 1;
          });
          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
          setServiceData(sorted);
        }
      })
      .catch(() => {});

    getTickets()
      .then((res) => {
        if (res.success) {
          setAllTickets(res.data);
          const counts = {};
          res.data.forEach((t) => {
            const type = t.ticket_type || "Other";
            counts[type] = (counts[type] || 0) + 1;
          });
          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
          setTicketTypeData(sorted);
        }
      })
      .catch(() => {});
  }, [isPremium]);

  if (!isPremium) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
          Analytics is a Premium Feature
        </h2>
        <p className="mt-3 max-w-md text-lg text-slate-500">
          Upgrade to the <span className="font-bold text-blue-600">Professional</span> or{" "}
          <span className="font-bold text-violet-600">Enterprise</span> plan to unlock
          detailed analytics, performance insights, and export capabilities.
        </p>
        <div className="mt-8 flex gap-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
            <h3 className="font-bold text-blue-700">Professional — ₱299/mo</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>• Analytics Dashboard</li>
              <li>• PDF & CSV Export</li>
              <li>• Performance Insights</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-left">
            <h3 className="font-bold text-violet-700">Enterprise — ₱999/mo</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>• Advanced Analytics</li>
              <li>• Custom Reports</li>
              <li>• Business Reviews</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- Compute real status distribution ---
  const finished = stats ? stats.finishedRequests + stats.finishedTickets : 0;
  const processing = stats ? stats.processingRequests + stats.processingTickets : 0;
  const pending = stats ? stats.pendingRequests + stats.pendingTickets : 0;
  const cancelled = stats
    ? stats.cancelledRequests +
      Math.max(
        0,
        stats.totalTickets -
          stats.finishedTickets -
          stats.processingTickets -
          stats.pendingTickets
      )
    : 0;
  const totalAll = finished + processing + pending + cancelled || 1;

  // --- Compute real completion rate ---
  const totalActivity = stats ? stats.totalRequests + stats.totalTickets : 0;
  const completionRate =
    totalActivity > 0 ? Math.round((finished / totalActivity) * 100) : 0;

  // --- Compute priority breakdown ---
  const priorityCounts = { Urgent: 0, High: 0, Normal: 0, Low: 0 };
  [...allRequests, ...allTickets].forEach((item) => {
    const p = item.priority || "Normal";
    if (priorityCounts[p] !== undefined) priorityCounts[p]++;
    else priorityCounts.Normal++;
  });
  const priorityEntries = Object.entries(priorityCounts).filter(([, v]) => v > 0);
  const maxPriority = Math.max(...priorityEntries.map((e) => e[1]), 1);
  const priorityColors = {
    Urgent: "bg-red-500",
    High: "bg-orange-500",
    Normal: "bg-blue-500",
    Low: "bg-slate-400",
  };

  // --- SVG donut ---
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutSegments = [
    { label: "Finished", count: finished, color: "#059669" },
    { label: "Processing", count: processing, color: "#fb923c" },
    { label: "Pending", count: pending, color: "#3b82f6" },
    { label: "Cancelled", count: cancelled, color: "#f87171" },
  ];
  let donutOffset = 0;

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <>
      <HeaderTitle
        title="Analytics"
        subtitle="Track your business performance and insights"
        action={
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white"
          >
            <FileText size={16} className="mr-2 inline" />
            Export PDF
          </button>
        }
      />

      {/* Top stat cards */}
      <div className="grid grid-cols-4 gap-5" id="analytics-content">
        {[
          [
            CheckCircle2,
            "text-emerald-500",
            `${completionRate}%`,
            "Completion Rate",
            `${finished} of ${totalActivity} completed`,
          ],
          [
            Star,
            "text-amber-500",
            stats && parseFloat(stats.avgRating) > 0
              ? `${stats.avgRating}/5`
              : "—",
            "Customer Rating",
            stats
              ? `${stats.totalRatings} review${stats.totalRatings === 1 ? "" : "s"}`
              : "No reviews",
          ],
          [
            ListChecks,
            "text-orange-500",
            stats ? stats.totalRequests : 0,
            "Service Requests",
            stats ? `${stats.processingRequests} in progress` : "",
          ],
          [
            Ticket,
            "text-blue-500",
            stats ? stats.totalTickets : 0,
            "Support Tickets",
            stats ? `${stats.pendingTickets} pending` : "",
          ],
        ].map(([Icon, iconColor, value, title, subtitle]) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100"
          >
            <Icon className={iconColor} />
            <h3 className="mt-6 text-2xl font-extrabold text-slate-950">{value}</h3>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-xs font-bold text-emerald-500">{subtitle}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Service Type + Status Distribution */}
      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-extrabold">Requests by Service Type</h3>
          {serviceData.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">No service requests yet.</p>
          ) : (
            serviceData.map(([label, value]) => {
              const maxCount = Math.max(...serviceData.map((d) => d[1]), 1);
              const pct = (value / maxCount) * 100;
              return (
                <div key={label} className="mt-4 flex items-center gap-4">
                  <span
                    className="w-40 truncate text-xs font-medium text-slate-500"
                    title={label}
                  >
                    {label}
                  </span>
                  <div className="h-5 flex-1 rounded bg-slate-50">
                    <div
                      className="h-full rounded bg-orange-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-slate-600">
                    {value}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-extrabold">Status Distribution</h3>
          <div className="mt-5 flex items-center gap-8">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {donutSegments.map((seg) => {
                const segLen = (seg.count / totalAll) * donutCircumference;
                const el = (
                  <circle
                    key={seg.label}
                    cx="60"
                    cy="60"
                    r={donutRadius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${segLen} ${donutCircumference - segLen}`}
                    strokeDashoffset={-donutOffset}
                    strokeLinecap="butt"
                    transform="rotate(-90 60 60)"
                  />
                );
                donutOffset += segLen;
                return el;
              })}
              <text
                x="60"
                y="58"
                textAnchor="middle"
                fill="#1e293b"
                fontSize="18"
                fontWeight="800"
              >
                {totalActivity}
              </text>
              <text
                x="60"
                y="72"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
              >
                TOTAL
              </text>
            </svg>

            <div className="space-y-2 text-sm">
              {donutSegments.map((seg) => (
                <p key={seg.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  {seg.label} <b>{seg.count}</b>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Tickets by Type + Priority Breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-extrabold">Tickets by Type</h3>
          {ticketTypeData.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">No tickets yet.</p>
          ) : (
            ticketTypeData.map(([label, value]) => {
              const maxCount = Math.max(...ticketTypeData.map((d) => d[1]), 1);
              const pct = (value / maxCount) * 100;
              return (
                <div key={label} className="mt-4 flex items-center gap-4">
                  <span
                    className="w-40 truncate text-xs font-medium text-slate-500"
                    title={label}
                  >
                    {label}
                  </span>
                  <div className="h-5 flex-1 rounded bg-slate-50">
                    <div
                      className="h-full rounded bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-slate-600">
                    {value}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-orange-100">
          <h3 className="text-lg font-extrabold">Priority Breakdown</h3>
          <p className="mt-1 text-xs text-slate-400">All requests & tickets</p>
          {priorityEntries.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">No data yet.</p>
          ) : (
            <div
              className="mt-4 flex items-end justify-around gap-3"
              style={{ minHeight: 120 }}
            >
              {priorityEntries.map(([label, value]) => {
                const barH = Math.max((value / maxPriority) * 80, 8);
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-600">{value}</span>
                    <div
                      className={`w-12 rounded-t ${priorityColors[label] || "bg-slate-400"}`}
                      style={{ height: barH }}
                    />
                    <span className="text-[10px] text-slate-400">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom summary */}
      <div className="mt-6 rounded-2xl bg-[#351000] p-6 text-white">
        <div className="flex items-center gap-4">
          <span className="rounded-xl bg-orange-500/20 p-4 text-orange-400">
            <TrendingUp />
          </span>
          <div>
            <h3 className="text-lg font-extrabold">Performance Summary</h3>
            <p className="font-semibold text-orange-300">
              {completionRate >= 80
                ? "Excellent!"
                : completionRate >= 50
                ? "Good progress!"
                : "Keep pushing!"}{" "}
              You have completed {finished} out of {totalActivity} total items (
              {completionRate}%).
              {stats && stats.totalRatings > 0
                ? ` Average rating: ${stats.avgRating}/5.`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
