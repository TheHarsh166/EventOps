import React, { useEffect, useState } from "react";
import { Clock, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { eventService } from "../../services/event.service.js";
import { registrationService } from "../../services/registration.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";

export function OrganizerWaitlistPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regsLoading, setRegsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const evts = await eventService.getOrganizerEvents();
        setEvents(evts);
        if (evts.length > 0) {
          setSelectedEventId(evts[0].id);
        }
      } catch (err) {
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    async function loadEventWaitlist() {
      try {
        setRegsLoading(true);
        const data = await registrationService.getEventRegistrations(selectedEventId);
        setRegistrations(data);
      } catch {
        // silent error handled in state
      } finally {
        setRegsLoading(false);
      }
    }
    loadEventWaitlist();
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const waitlistedEntries = registrations.filter((r) => r.status === "WAITLISTED");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Waitlist Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Automatic FIFO waitlist promotion is enforced by the database transaction when seats become available.
        </p>
      </div>

      {/* Event Selector & Capacity Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex-1 max-w-md">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            Select Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.status})
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Available Seats</span>
              <span className="text-xl font-bold text-slate-900">
                {selectedEvent.availableSeats} / {selectedEvent.capacity}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">In Waitlist Queue</span>
              <span className="text-xl font-bold text-purple-600">
                {waitlistedEntries.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info notice explaining backend engine */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-semibold block">Automatic Promotion Engine:</span>
          When a confirmed attendee cancels or an organizer rejects an application, the backend transaction automatically identifies the earliest waiting attendee, atomically assigns the released seat, and transitions the status to CONFIRMED or PAYMENT_PENDING.
        </div>
      </div>

      {/* Waitlist Table */}
      {regsLoading ? (
        <div className="h-40 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading waitlist...
        </div>
      ) : waitlistedEntries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No attendees on the waitlist"
          description="There are currently no waiting attendees for this event. As capacity fills, overflow sign-ups will be queued here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Queue Position</th>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Queued Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitlistedEntries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-sm font-semibold text-slate-700">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {entry.user?.name || "Attendee"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {entry.user?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
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
