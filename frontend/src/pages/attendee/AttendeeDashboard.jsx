import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Ticket, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { registrationService } from "../../services/registration.service.js";
import { eventService } from "../../services/event.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";

export function AttendeeDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [regs, evts] = await Promise.all([
          registrationService.getMyRegistrations(),
          eventService.getPublishedEvents()
        ]);
        if (mounted) {
          setRegistrations(regs);
          setExploreEvents(evts.slice(0, 3));
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load dashboard data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const upcomingRegistrations = registrations.filter(
    (r) => r.status === "CONFIRMED" || r.status === "PENDING" || r.status === "PAYMENT_PENDING"
  );

  const pendingPayments = registrations.filter((r) => r.status === "PAYMENT_PENDING");

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Attendee Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
            Track your event registrations, check status approvals, complete payments, and discover new upcoming experiences.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/events">
            <Button variant="primary" className="flex items-center gap-2">
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notice if payment pending */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900 font-medium">
              You have {pendingPayments.length} registration(s) awaiting payment confirmation.
            </p>
          </div>
          <Link to="/app/registrations">
            <Button variant="outline" size="sm" className="bg-white text-amber-800 border-amber-300">
              Pay Now
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Registrations"
          value={registrations.length}
          subtitle="All-time registrations"
          icon={Ticket}
        />
        <StatCard
          title="Active Events"
          value={upcomingRegistrations.length}
          subtitle="Confirmed or pending events"
          icon={Calendar}
        />
        <StatCard
          title="Waitlisted"
          value={registrations.filter((r) => r.status === "WAITLISTED").length}
          subtitle="Awaiting seats"
          icon={Clock}
        />
      </div>

      {/* Upcoming Registrations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your Upcoming Registrations</h2>
          <Link
            to="/app/registrations"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingRegistrations.length === 0 ? (
          <EmptyState
            title="No upcoming registrations"
            description="You haven't registered for any upcoming events yet. Discover events happening soon."
            actionLabel="Explore Events"
            onAction={() => window.location.assign("/events")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingRegistrations.slice(0, 3).map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={reg.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">
                    {reg.event?.title || "Event"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    📍 {reg.event?.location || "TBA"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    📅{" "}
                    {reg.event?.startTime
                      ? new Date(reg.event.startTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Schedule TBA"}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/events/${reg.eventId}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Event Details →
                  </Link>
                  <Link
                    to="/app/registrations"
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured / Recommended Events */}
      {exploreEvents.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Featured Events</h2>
              <p className="text-xs text-slate-500">Discover top community events and sessions</p>
            </div>
            <Link
              to="/events"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Browse all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {exploreEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {evt.availableSeats > 0 ? `${evt.availableSeats} seats left` : "Full / Waitlist"}
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-1 line-clamp-1">{evt.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {evt.description || "Join this event to learn, connect, and collaborate."}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    {evt.location || "Online"}
                  </span>
                  <Link to={`/events/${evt.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
