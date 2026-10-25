import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { adminService } from "../../services/admin.service.js";
import { StatCard } from "../../components/common/StatCard.jsx";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";

export function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getPlatformAnalytics();
        if (mounted) setData(res);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load platform analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const overview = data?.overview || {
    totalUsers: 0,
    totalAttendees: 0,
    totalOrganizers: 0,
    totalAdmins: 0,
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    cancelledEvents: 0,
    totalRegistrations: 0,
    totalWaitlist: 0,
    grossRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0
  };

  const recentEvents = data?.events || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            System Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global metrics for accounts, hosted events, registration concurrency, and PayU financial settlement.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/events">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Manage Events
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Platform Users"
          value={overview.totalUsers}
          subtitle={`${overview.totalAttendees} attendees • ${overview.totalOrganizers} organizers`}
          icon={Users}
        />
        <StatCard
          title="Total Events"
          value={overview.totalEvents}
          subtitle={`${overview.publishedEvents} published • ${overview.draftEvents} draft`}
          icon={Calendar}
        />
        <StatCard
          title="Registration Volume"
          value={overview.totalRegistrations}
          subtitle={`${overview.totalWaitlist} currently in queue`}
          icon={CheckCircle}
        />
        <StatCard
          title="Gross Revenue (PayU)"
          value={`₹${overview.grossRevenue.toLocaleString("en-IN")}`}
          subtitle={`Net: ₹${overview.netRevenue.toLocaleString("en-IN")} • Refunds: ₹${overview.totalRefunds.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
      </div>

      {/* Role Breakdown Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">User Population Distribution</h3>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div
            className="bg-indigo-600 h-full"
            style={{ width: `${(overview.totalAttendees / (overview.totalUsers || 1)) * 100}%` }}
            title="Attendees"
          />
          <div
            className="bg-purple-600 h-full"
            style={{ width: `${(overview.totalOrganizers / (overview.totalUsers || 1)) * 100}%` }}
            title="Organizers"
          />
          <div
            className="bg-red-500 h-full"
            style={{ width: `${(overview.totalAdmins / (overview.totalUsers || 1)) * 100}%` }}
            title="Admins"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-5 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Attendees: <strong>{overview.totalAttendees}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            Organizers: <strong>{overview.totalOrganizers}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Admins: <strong>{overview.totalAdmins}</strong>
          </span>
        </div>
      </div>

      {/* Global Events Oversight Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Platform Events</h2>
            <p className="text-xs text-slate-500">Global listing of all hosted events and host organizers</p>
          </div>
          <Link to="/admin/events">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600">
              View All Events ({recentEvents.length}) →
            </Button>
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No events created on platform"
              description="Events will show here once created by registered organizers."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.slice(0, 5).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>
                        <span>{evt.title}</span>
                        <span className="block text-xs font-normal text-slate-400">
                          {new Date(evt.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>
                        <span className="font-medium text-slate-900">{evt.organizer?.name}</span>
                        <span className="block text-slate-400">{evt.organizer?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {evt.availableSeats} / {evt.capacity} available
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                      {evt.registrationsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to="/admin/events">
                        <Button variant="outline" size="sm" className="text-xs">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
