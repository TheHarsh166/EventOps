import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Check,
  X,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar
} from "lucide-react";
import { eventService } from "../../services/event.service.js";
import { registrationService } from "../../services/registration.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function OrganizerRegistrationsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedEventId = searchParams.get("eventId");

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId || "");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regsLoading, setRegsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Approval / Rejection Dialog
  const [actionDialog, setActionDialog] = useState({
    isOpen: false,
    type: null, // "approve" | "reject"
    reg: null,
    loading: false
  });

  // Load Organizer Events for dropdown
  useEffect(() => {
    async function loadEventsList() {
      try {
        setLoading(true);
        setError(null);
        const evts = await eventService.getOrganizerEvents();
        setEvents(evts);
        if (evts.length > 0) {
          const targetId = preselectedEventId || evts[0].id;
          setSelectedEventId(targetId);
        }
      } catch (err) {
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    loadEventsList();
  }, [preselectedEventId]);

  // Load Registrations whenever selectedEventId changes
  const loadEventRegistrations = async (evtId) => {
    if (!evtId) return;
    try {
      setRegsLoading(true);
      const data = await registrationService.getEventRegistrations(evtId);
      setRegistrations(data);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to load registrations", "error");
    } finally {
      setRegsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadEventRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const handleOpenAction = (type, reg) => {
    setActionDialog({
      isOpen: true,
      type,
      reg,
      loading: false
    });
  };

  const handleConfirmAction = async () => {
    const { type, reg } = actionDialog;
    if (!reg) return;

    try {
      setActionDialog((prev) => ({ ...prev, loading: true }));
      if (type === "approve") {
        await registrationService.approveRegistration(reg.id);
        showToast(`Registration for ${reg.user?.name || "attendee"} approved!`, "success");
      } else if (type === "reject") {
        await registrationService.rejectRegistration(reg.id);
        showToast(`Registration for ${reg.user?.name || "attendee"} rejected`, "info");
      }
      setActionDialog({ isOpen: false, type: null, reg: null, loading: false });
      await loadEventRegistrations(selectedEventId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Action failed";
      showToast(msg, "error");
      setActionDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const name = reg.user?.name || "";
    const email = reg.user?.email || "";
    const matchesQuery =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || reg.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendee Registrations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review attendee sign-ups, approve pending applications, and manage capacities.
          </p>
        </div>
      </div>

      {/* Event Selector & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
            Select Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSearchParams({ eventId: e.target.value });
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Registrations Data Table */}
      {regsLoading ? (
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading registrations...
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registrations found"
          description="There are currently no registrations for this event matching your query."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {reg.user?.name || "Unknown Attendee"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {reg.user?.email || "No email"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(reg.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {reg.status === "PENDING" ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenAction("approve", reg)}
                            className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAction("reject", reg)}
                            className="text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Approval or Rejection */}
      <ConfirmationDialog
        isOpen={actionDialog.isOpen}
        title={
          actionDialog.type === "approve"
            ? `Approve registration for ${actionDialog.reg?.user?.name}?`
            : `Reject registration for ${actionDialog.reg?.user?.name}?`
        }
        description={
          actionDialog.type === "approve"
            ? "Approving will confirm the seat (or advance to PAYMENT_PENDING if a fee is required) and automatically notify the attendee."
            : "Rejecting will release the reserved seat immediately and automatically promote the next attendee waiting on the waitlist."
        }
        confirmLabel={actionDialog.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
        cancelLabel="Cancel"
        variant={actionDialog.type === "approve" ? "primary" : "danger"}
        isLoading={actionDialog.loading}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionDialog({ isOpen: false, type: null, reg: null, loading: false })}
      />
    </div>
  );
}
