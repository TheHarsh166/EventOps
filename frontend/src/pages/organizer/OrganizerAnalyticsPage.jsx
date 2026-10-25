import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Users,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { analyticsService } from "../../services/analytics.service.js";
import { StatCard } from "../../components/common/StatCard.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export function OrganizerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const res = await analyticsService.getOrganizerAnalytics();
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const overview = data?.overview || {
    totalEvents: 0,
    totalRegistrations: 0,
    confirmedAttendees: 0,
    grossRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0
  };

  const eventBreakdown = data?.eventBreakdown || [];

  // Chart data: registrations by event
  const chartData = eventBreakdown.map((e) => ({
    name: e.title.length > 18 ? e.title.slice(0, 18) + "..." : e.title,
    confirmed: e.confirmedCount,
    pending: e.pendingCount,
    waitlist: e.waitlistCount
  }));

  // Status distribution for Pie chart
  const statusPieData = [
    { name: "Confirmed", value: overview.confirmedAttendees },
    { name: "Pending", value: overview.pendingApprovals },
    { name: "Waitlisted", value: overview.waitlistCount }
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Verified financial figures, registration velocity, and capacity utilization derived from Postgres transactions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Net Revenue"
          value={`₹${overview.netRevenue.toLocaleString("en-IN")}`}
          subtitle={`Gross: ₹${overview.grossRevenue.toLocaleString("en-IN")} • Refunds: ₹${overview.totalRefunds.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Total Registrations"
          value={overview.totalRegistrations}
          subtitle={`Across ${overview.totalEvents} published/draft events`}
          icon={Users}
        />
        <StatCard
          title="Confirmed Seats"
          value={overview.confirmedAttendees}
          subtitle="Confirmed attendees"
          icon={CheckCircle2}
        />
      </div>

      {/* Recharts Analytics Charts */}
      {eventBreakdown.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data available"
          description="Create and publish events to start generating attendee registration metrics and revenue charts."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Registrations by Event
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Confirmed vs pending vs waitlisted attendees per event
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "none",
                      borderRadius: "8px",
                      color: "#FFF",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="confirmed" fill="#4F46E5" name="Confirmed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="waitlist" fill="#8B5CF6" name="Waitlist" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Status Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Status Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Proportion of registration statuses
              </p>
            </div>

            {statusPieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                No active attendee statuses
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 justify-center text-xs">
              {statusPieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-slate-600 font-medium">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Data Table */}
      {eventBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Detailed Event Telemetry
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Confirmed</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Waitlist</th>
                  <th className="py-3 px-4 text-right">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventBreakdown.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.title}</td>
                    <td className="py-3 px-4 text-slate-600">{row.capacity}</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">{row.confirmedCount}</td>
                    <td className="py-3 px-4 text-amber-600 font-medium">{row.pendingCount}</td>
                    <td className="py-3 px-4 text-purple-600 font-medium">{row.waitlistCount}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
