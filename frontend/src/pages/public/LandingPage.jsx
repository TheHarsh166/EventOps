import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { EventCard } from "../../components/events/EventCard.jsx";
import { eventService } from "../../services/event.service.js";

export function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await eventService.getPublishedEvents();
        setEvents(data.slice(0, 3)); // show top 3 upcoming
      } catch (err) {
        console.error("Failed to fetch landing events", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Better events. Greater impact.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Every event. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                One seamless experience.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover industry-leading events, manage atomic ticket reservations, process PayU payments, coordinate automatic waitlists, and measure event performance in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/events" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-md shadow-indigo-200">
                  Explore Events
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup?role=ORGANIZER" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  For Organizers
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-100 shadow-2xl border border-slate-200">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-16/9 flex flex-col justify-between p-6 sm:p-10 relative">
              <div className="flex items-center justify-between z-10 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">eventops.platform/live-dashboard</span>
              </div>

              <div className="my-auto text-center space-y-4 z-10">
                <span className="px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-500/30">
                  Autonomous Waitlist & Ticketing Engine
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  Engineered for High-Concurrency Operations
                </h3>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Zero double-bookings with transactional seat locking, verified PayU hosted checkout, and automatic waitlist queue promotion.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-left z-10">
                <div>
                  <div className="text-xs text-slate-400">Transaction Guarantee</div>
                  <div className="text-sm font-semibold text-emerald-400">PostgreSQL Serializable</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Payment Gateway</div>
                  <div className="text-sm font-semibold text-indigo-400">PayU SHA-512 Verified</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Promotion Algorithm</div>
                  <div className="text-sm font-semibold text-white">First-In-First-Out FIFO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Events Feed</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Upcoming Live Events
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verified events currently open for registration or waitlist.
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" size="sm" className="gap-1.5">
                Browse All Events
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900">No published events currently available</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check back shortly or sign up as an organizer to publish your conference.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Why EventOps</span>
            <h2 className="text-3xl font-bold text-slate-900">
              Built for precision, speed, and trust
            </h2>
            <p className="text-sm text-slate-600">
              Every critical workflow is handled with transactional consistency and transparent state transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Atomic Seat Reservations</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Database-level seat decrements prevent overselling, guaranteeing that attendees who register always get their seat.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Smart Waitlist Promotion</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                When a confirmed attendee cancels, the system automatically advances the next eligible waiting attendee into the slot.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900">PayU Payment & Refunds</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Seamless SHA-512 hashed hosted checkout, instant payment validation, and automated refund requests for attendee cancellations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizers CTA */}
      <section id="organizers" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Are you organizing a conference or summit?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Access organizer analytics, approval workflows, attendee tracking, and gross revenue metrics from a centralized dashboard.
          </p>
          <div className="pt-2">
            <Link to="/signup?role=ORGANIZER">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Create Organizer Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
