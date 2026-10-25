import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  CheckCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { analyticsService } from "../../services/analytics.service.js";
import { eventService } from "../../services/event.service.js";
import { StatCard } from "../../components/common/StatCard.jsx";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";

export function OrganizerOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);
        const [anData, evts] = await Promise.all([
          analyticsService.getOrganizerAnalytics(),
          eventService.getOrganizerEvents()
        ]);
        if (mounted) {
          setAnalytics(anData);
          setRecentEvents(evts);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load organizer analytics");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse" />
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

  const overview = analytics?.overview || {
    totalEvents: 0,
    totalRegistrations: 0,
    confirmedAttendees: 0,
    pendingApprovals: 0,
    waitlistCount: 0,
    netRevenue: 0
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Organizer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Event Management Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry and management controls for your events, registrations, and revenue.
          </p>
        </div>

        <Link to="/organizer/events/new">
          <Button variant="primary" className="flex items-center gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Events"
          value={overview.totalEvents}
          subtitle="Managed by your account"
          icon={Calendar}
        />
        <StatCard
          title="Total Registrations"
          value={overview.totalRegistrations}
          subtitle="Across all events"
          icon={Users}
        />
        <StatCard
          title="Confirmed Attendees"
          value={overview.confirmedAttendees}
          subtitle="Seats verified"
          icon={CheckCircle}
        />
        <StatCard
          title="Net Revenue"
          value={`₹${overview.netRevenue.toLocaleString("en-IN")}`}
          subtitle="Realized via PayU"
          icon={IndianRupee}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-amber-800">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-amber-950 mt-0.5">
                {overview.pendingApprovals}
              </p>
            </div>
          </div>
          <Link to="/organizer/registrations">
            <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-800">
              Review Queue
            </Button>
          </Link>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-purple-800">
                Total On Waitlist
              </p>
              <p className="text-2xl font-bold text-purple-950 mt-0.5">
                {overview.waitlistCount}
              </p>
            </div>
          </div>
          <Link to="/organizer/waitlist">
            <Button variant="outline" size="sm" className="bg-white border-purple-300 text-purple-800">
              View Waitlist
            </Button>
          </Link>
        </div>
      </div>

      {/* Events Table / Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your Events Performance</h2>
            <p className="text-xs text-slate-500">Live seat and registration breakdown by event</p>
          </div>
          <Link to="/organizer/events">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600">
              Manage All Events →
            </Button>
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No events created yet"
              description="Get started by creating your first event to start accepting attendees."
              actionLabel="Create Event"
              onAction={() => window.location.assign("/organizer/events/new")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Capacity / Seats</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>
                        <span className="font-semibold text-slate-900">{evt.title}</span>
                        <p className="text-xs text-slate-500">{evt.location || "Online / TBA"}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(evt.startTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {evt.capacity - evt.availableSeats}
                      </span>{" "}
                      / {evt.capacity} booked ({evt.availableSeats} left)
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link to={`/organizer/events/${evt.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/events/${evt.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View
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
