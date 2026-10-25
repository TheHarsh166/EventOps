import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  AlertCircle,
  CreditCard,
  Ban,
  Clock,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { registrationService } from "../../services/registration.service.js";
import { paymentService } from "../../services/payment.service.js";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorState } from "../../components/common/ErrorState.jsx";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function MyRegistrationsPage() {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

  // Cancellation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment initiation state
  const [payingRegId, setPayingRegId] = useState(null);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleOpenCancel = (reg) => {
    setSelectedReg(reg);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReg) return;
    try {
      setActionLoading(true);
      if (selectedReg.payment?.status === "SUCCEEDED") {
        // Paid registration -> calls refund endpoint
        await registrationService.requestRefund(selectedReg.id);
        showToast("Cancellation and refund requested successfully", "success");
      } else {
        // Standard cancellation endpoint
        await registrationService.cancelRegistration(selectedReg.id);
        showToast("Registration cancelled successfully", "success");
      }
      setCancelModalOpen(false);
      setSelectedReg(null);
      await loadRegistrations();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Cancellation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiatePayment = async (regId) => {
    try {
      setPayingRegId(regId);
      const paymentData = await paymentService.initiatePayment(regId);
      if (paymentData.action && paymentData.fields) {
        showToast("Redirecting to PayU checkout...", "info");
        paymentService.submitPayUForm(paymentData.action, paymentData.fields);
      } else {
        throw new Error("Invalid payment response from server");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Payment initiation failed", "error");
      setPayingRegId(null);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CONFIRMED") return reg.status === "CONFIRMED";
    if (activeTab === "PENDING") return reg.status === "PENDING" || reg.status === "PAYMENT_PENDING";
    if (activeTab === "WAITLISTED") return reg.status === "WAITLISTED";
    if (activeTab === "CANCELLED") return reg.status === "CANCELLED" || reg.status === "REJECTED";
    return true;
  });

  const tabs = [
    { id: "ALL", label: "All", count: registrations.length },
    { id: "CONFIRMED", label: "Confirmed", count: registrations.filter((r) => r.status === "CONFIRMED").length },
    { id: "PENDING", label: "Pending", count: registrations.filter((r) => r.status === "PENDING" || r.status === "PAYMENT_PENDING").length },
    { id: "WAITLISTED", label: "Waitlisted", count: registrations.filter((r) => r.status === "WAITLISTED").length },
    { id: "CANCELLED", label: "Inactive", count: registrations.filter((r) => r.status === "CANCELLED" || r.status === "REJECTED").length }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse" />
        <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadRegistrations} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Registrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your booked events, complete pending payments, and check confirmation status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations in this tab"
          description="You don't have any event registrations matching the selected filter."
          actionLabel="Browse Events"
          onAction={() => window.location.assign("/events")}
        />
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => {
            const isPaid = reg.payment?.status === "SUCCEEDED";
            const canCancel =
              reg.status === "CONFIRMED" ||
              reg.status === "PENDING" ||
              reg.status === "WAITLISTED" ||
              reg.status === "PAYMENT_PENDING";

            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={reg.status} />
                    {reg.payment && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        Payment: {reg.payment.status} (₹{(reg.payment.amount / 100).toFixed(2)})
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Booked {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {reg.event?.title || "Event details unavailable"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {reg.event?.location || "TBA"} • 📅{" "}
                      {reg.event?.startTime
                        ? new Date(reg.event.startTime).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Date TBA"}
                    </p>
                  </div>

                  {reg.status === "PAYMENT_PENDING" && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200 inline-block">
                      ⚠️ Seat held pending payment confirmation. Please complete checkout to secure your ticket.
                    </p>
                  )}

                  {reg.status === "WAITLISTED" && (
                    <p className="text-xs text-purple-700 bg-purple-50 rounded-lg p-2 border border-purple-200 inline-block">
                      ⏳ You are currently on the waitlist. You will be automatically notified and promoted when a seat opens.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <Link to={`/events/${reg.eventId}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Event
                    </Button>
                  </Link>

                  {reg.status === "PAYMENT_PENDING" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInitiatePayment(reg.id)}
                      loading={payingRegId === reg.id}
                      className="flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Now
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCancel(reg)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {isPaid ? "Cancel & Refund" : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={cancelModalOpen}
        title={
          selectedReg?.payment?.status === "SUCCEEDED"
            ? "Cancel Registration & Request Refund"
            : "Cancel Registration"
        }
        description={
          selectedReg?.payment?.status === "SUCCEEDED"
            ? `Are you sure you want to cancel your confirmed registration for "${selectedReg?.event?.title}"? A refund request of ₹${(selectedReg.payment.amount / 100).toFixed(2)} will be initiated via PayU according to backend refund rules.`
            : `Are you sure you want to cancel your registration for "${selectedReg?.event?.title}"? Your reserved seat will be immediately released to the next person on the waitlist.`
        }
        confirmLabel={selectedReg?.payment?.status === "SUCCEEDED" ? "Cancel & Refund" : "Yes, Cancel"}
        cancelLabel="Keep Registration"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedReg(null);
        }}
      />
    </div>
  );
}
