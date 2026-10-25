import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Calendar, MapPin, Users, ShieldAlert } from "lucide-react";
import { eventService } from "../../services/event.service.js";
import { Button } from "../../components/common/Button.jsx";
import { FormField } from "../../components/forms/FormField.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function EventEditorPage() {
  const { eventId } = useParams();
  const isEditing = !!eventId;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: 50,
    approvalRequired: false,
    overbookingBuffer: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      async function loadEvent() {
        try {
          setLoading(true);
          const evt = await eventService.getEventById(eventId);
          if (evt) {
            setFormData({
              title: evt.title || "",
              description: evt.description || "",
              location: evt.location || "",
              startTime: evt.startTime ? new Date(evt.startTime).toISOString().slice(0, 16) : "",
              endTime: evt.endTime ? new Date(evt.endTime).toISOString().slice(0, 16) : "",
              capacity: evt.capacity || 50,
              approvalRequired: Boolean(evt.approvalRequired),
              overbookingBuffer: evt.overbookingBuffer || 0
            });
          }
        } catch (err) {
          showToast(err.message || "Failed to load event details", "error");
          navigate("/organizer/events");
        } finally {
          setLoading(false);
        }
      }
      loadEvent();
    }
  }, [eventId, isEditing, navigate, showToast]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Event title is required";
    if (!formData.startTime) errs.startTime = "Start time is required";
    if (!formData.endTime) errs.endTime = "End time is required";
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        errs.endTime = "End time must be strictly after start time";
      }
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      errs.capacity = "Capacity must be a positive integer";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        capacity: Number(formData.capacity),
        approvalRequired: Boolean(formData.approvalRequired),
        overbookingBuffer: Number(formData.overbookingBuffer || 0)
      };

      if (isEditing) {
        await eventService.updateEvent(eventId, payload);
        showToast("Event updated successfully", "success");
      } else {
        await eventService.createEvent(payload);
        showToast("Event created as DRAFT successfully", "success");
      }
      navigate("/organizer/events");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save event";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/organizer/events"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditing
              ? "Update event metadata and schedule constraints."
              : "Set up dates, venue, capacity constraints, and approval workflows."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6"
      >
        <FormField
          label="Event Title"
          required
          error={errors.title}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. NextGen Web Architecture Summit 2026"
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Event Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the agenda, speakers, prerequisites..."
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <FormField
          label="Venue / Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g. Convention Center, Hall B or Zoom link"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Start Time"
            type="datetime-local"
            required
            error={errors.startTime}
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />

          <FormField
            label="End Time"
            type="datetime-local"
            required
            error={errors.endTime}
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <FormField
            label="Seat Capacity"
            type="number"
            min={1}
            required
            error={errors.capacity}
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            disabled={isEditing}
          />

          <FormField
            label="Overbooking Buffer"
            type="number"
            min={0}
            value={formData.overbookingBuffer}
            onChange={(e) => setFormData({ ...formData, overbookingBuffer: e.target.value })}
            disabled={isEditing}
          />
        </div>

        {isEditing && (
          <p className="text-xs text-slate-400">
            Note: Maximum capacity and buffer are locked after initial creation to protect seat reservations and concurrency invariants.
          </p>
        )}

        {/* Approval Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.approvalRequired}
              onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
              className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Require Manual Organizer Approval
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                When enabled, registrations remain in PENDING status until you manually approve or reject them.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/organizer/events">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" loading={submitting} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
