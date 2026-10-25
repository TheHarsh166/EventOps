import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  Share2
} from "lucide-react";
import { eventService } from "../../services/event.service.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Button } from "../../components/common/Button.jsx";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { formatDate, formatDateTime, formatCurrency } from "../../utils/cn.js";
import { getErrorMessage } from "../../services/api.js";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const data = await eventService.getEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(getErrorMessage(err, "Event not found or currently unavailable"));
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in or create an attendee account to register");
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (user.role !== "ATTENDEE") {
      toast.error("Only Attendee accounts can register for events");
      return;
    }

    setActionLoading(true);
    try {
      const res = await eventService.registerForEvent(eventId);
      toast.success(res.message || "Registration successful!");
      // Refresh event seat count
      const updated = await eventService.getEventById(eventId);
      setEvent(updated);
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to join the event waitlist");
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (user.role !== "ATTENDEE") {
      toast.error("Only Attendee accounts can join waitlists");
      return;
    }

    setActionLoading(true);
    try {
      const res = await eventService.joinWaitlist(eventId);
      toast.success(res.message || "Added to event waitlist!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to join waitlist"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded-md w-1/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">{error || "Event not found"}</h2>
        <p className="text-sm text-slate-500">
          The event you are looking for does not exist or has not been published yet.
        </p>
        <Link to="/events">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Explore Events
          </Button>
        </Link>
      </div>
    );
  }

  const isFull = event.availableSeats <= 0;
  const isPaid = Number(event.price ?? 0) > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Hero */}
          <div className="h-64 sm:h-80 rounded-2xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden border border-slate-800 shadow-md">
            <div className="flex justify-between items-start z-10">
              <StatusBadge status={event.status} className="bg-white/90 backdrop-blur-xs" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info("Event URL copied to clipboard");
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-xs transition-colors"
                title="Share event"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="z-10 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(event.startTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About This Event
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description || "No extended description provided for this event."}
            </div>
          </div>

          {/* Location & Time Card */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Schedule & Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Venue Location</div>
                  <div className="text-xs text-slate-600 mt-0.5">{event.location || "Online Event"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Date & Schedule</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Starts: {formatDateTime(event.startTime)}
                  </div>
                  <div className="text-xs text-slate-600">
                    Ends: {formatDateTime(event.endTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Registration Action (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 sticky top-24">
            {/* Price Box */}
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Price</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(event.price)}
              </span>
            </div>

            {/* Seat status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Seat Availability</span>
                <span className={isFull ? "text-amber-600 font-semibold" : "text-emerald-700 font-semibold"}>
                  {isFull ? "Event Full (Waitlist Open)" : `${event.availableSeats} of ${event.capacity} left`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((event.capacity - event.availableSeats) / event.capacity) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Approval Notice */}
            {event.approvalRequired && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
                <strong>Organizer Approval Required:</strong> Your ticket will be reviewed by the event organizer before confirmation.
              </div>
            )}

            {/* CTA Buttons */}
            {isFull ? (
              <Button
                variant="outline"
                className="w-full justify-center border-purple-600 text-purple-700 hover:bg-purple-50"
                onClick={handleJoinWaitlist}
                loading={actionLoading}
              >
                Join Waitlist
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full justify-center shadow-md shadow-indigo-100"
                onClick={handleRegister}
                loading={actionLoading}
              >
                {event.approvalRequired ? "Submit for Approval" : isPaid ? "Register & Pay with PayU" : "Reserve Free Ticket"}
              </Button>
            )}

            {/* Guarantee */}
            <div className="text-[11px] text-slate-400 text-center space-y-1 pt-2 border-t border-slate-100">
              <p className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Atomic seat booking guarantee
              </p>
              <p>Tickets and refund requests can be cancelled directly through your attendee portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
