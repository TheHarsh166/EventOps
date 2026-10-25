import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Send,
  Ban,
  Users
} from "lucide-react";
import { eventService } from "../../services/event.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function MyEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Action state (publish / cancel)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // "publish" | "cancel"
    event: null,
    loading: false
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getOrganizerEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenAction = (type, event) => {
    setActionModal({
      isOpen: true,
      type,
      event,
      loading: false
    });
  };

  const handleConfirmAction = async () => {
    const { type, event } = actionModal;
    if (!event) return;

    try {
      setActionModal((prev) => ({ ...prev, loading: true }));
      if (type === "publish") {
        await eventService.publishEvent(event.id);
        showToast(`"${event.title}" published successfully!`, "success");
      } else if (type === "cancel") {
        await eventService.cancelEvent(event.id);
        showToast(`"${event.title}" has been cancelled`, "info");
      }
      setActionModal({ isOpen: false, type: null, event: null, loading: false });
      await loadEvents();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Action failed", "error");
      setActionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.location && evt.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || evt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadEvents} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, edit, publish, and monitor capacity for your hosted events.
          </p>
        </div>

        <Link to="/organizer/events/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={
            searchQuery || statusFilter !== "ALL"
              ? "No events match the selected filters."
              : "You haven't created any events yet."
          }
          actionLabel="Create Event"
          onAction={() => window.location.assign("/organizer/events/new")}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Capacity / Availability</th>
                  <th className="py-3 px-4">Rules</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-medium text-slate-900">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm block">
                          {evt.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          📍 {evt.location || "Online"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div>
                        <span className="font-medium text-slate-800">
                          {new Date(evt.startTime).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span className="block text-slate-400">
                          {new Date(evt.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}{" "}
                          -{" "}
                          {new Date(evt.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {evt.capacity - evt.availableSeats}
                      </span>{" "}
                      / {evt.capacity} booked
                      <span className="block text-[11px] text-emerald-600 font-medium">
                        {evt.availableSeats} seats remaining
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {evt.approvalRequired ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          Approval Required
                        </span>
                      ) : (
                        <span className="text-slate-500">Auto Confirm</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {evt.status === "DRAFT" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAction("publish", evt)}
                          className="text-xs py-1 px-2.5"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Publish
                        </Button>
                      )}

                      <Link to={`/organizer/events/${evt.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>

                      {evt.status === "PUBLISHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAction("cancel", evt)}
                          className="text-xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      )}

                      <Link to={`/events/${evt.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs py-1 px-2">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Publish / Cancel */}
      <ConfirmationDialog
        isOpen={actionModal.isOpen}
        title={
          actionModal.type === "publish"
            ? `Publish "${actionModal.event?.title}"?`
            : `Cancel "${actionModal.event?.title}"?`
        }
        description={
          actionModal.type === "publish"
            ? "Publishing this event will make it immediately visible to attendees in the public directory and open registrations."
            : "Cancelling this event cannot be undone. Attendees will no longer be able to register."
        }
        confirmLabel={actionModal.type === "publish" ? "Publish Event" : "Cancel Event"}
        cancelLabel="Dismiss"
        variant={actionModal.type === "publish" ? "primary" : "danger"}
        isLoading={actionModal.loading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: null, event: null, loading: false })}
      />
    </div>
  );
}
