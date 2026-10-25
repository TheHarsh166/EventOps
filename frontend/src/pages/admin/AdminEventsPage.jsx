import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Search,
  CheckCircle,
  Ban,
  Send,
  ExternalLink,
  Users,
  Filter
} from "lucide-react";
import { adminService } from "../../services/admin.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function AdminEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // "publish" | "cancel"
    event: null,
    loading: false
  });

  const loadEvents = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAllEvents({
        status: statusFilter,
        search,
        page,
        limit: 20
      });
      setEvents(res.events || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents(1);
  };

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
        await adminService.publishEvent(event.id);
        showToast(`Event "${event.title}" published successfully`, "success");
      } else if (type === "cancel") {
        await adminService.cancelEvent(event.id);
        showToast(`Event "${event.title}" cancelled administratively`, "info");
      }
      setActionModal({ isOpen: false, type: null, event: null, loading: false });
      await loadEvents(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Action failed", "error");
      setActionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Event Administration</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor all published and draft events across organizers with direct administrative controls.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadEvents(1)} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events match query"
          description="Try adjusting your search criteria or status filter."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Capacity / Booked</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block text-sm">
                          {evt.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          📍 {evt.location || "Online"}
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
                      <span className="font-semibold text-slate-900">
                        {evt._count?.registrations || 0}
                      </span>{" "}
                      / {evt.capacity} seats
                      <span className="block text-slate-400 text-[11px]">
                        {evt.availableSeats} available
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(evt.startTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
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

                      {evt.status === "PUBLISHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAction("cancel", evt)}
                          className="text-xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Cancel Event
                        </Button>
                      )}

                      <Link to={`/events/${evt.id}`} target="_blank">
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

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadEvents(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadEvents(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={actionModal.isOpen}
        title={
          actionModal.type === "publish"
            ? `Administratively Publish "${actionModal.event?.title}"?`
            : `Administratively Cancel "${actionModal.event?.title}"?`
        }
        description={
          actionModal.type === "publish"
            ? "Publishing will immediately expose this event in the public directory and allow attendees to book seats."
            : "Cancelling will prevent further registrations and mark the event CANCELLED platform-wide."
        }
        confirmLabel={actionModal.type === "publish" ? "Confirm Publish" : "Confirm Cancellation"}
        cancelLabel="Dismiss"
        variant={actionModal.type === "publish" ? "primary" : "danger"}
        isLoading={actionModal.loading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: null, event: null, loading: false })}
      />
    </div>
  );
}
