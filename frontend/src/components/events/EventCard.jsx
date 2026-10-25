import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { formatDate, formatCurrency } from "../../utils/cn.js";
import { StatusBadge } from "../common/StatusBadge.jsx";

export function EventCard({ event }) {
  const {
    id,
    title,
    description,
    location,
    startTime,
    availableSeats,
    capacity,
    price,
    status
  } = event;

  const isFull = availableSeats <= 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Event Header Banner/Image placeholder */}
      <div className="h-44 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 relative p-5 flex flex-col justify-between overflow-hidden">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="flex justify-between items-start relative z-10">
          <StatusBadge status={status} className="bg-white/90 backdrop-blur-xs shadow-xs" />
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-xs font-semibold rounded-md text-slate-800 shadow-xs">
            {formatCurrency(price)}
          </span>
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-200 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(startTime)}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description || "Join us for this premier event. Discover new insights, connect with industry leaders, and network with peers."}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location || "Online"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isFull ? (
                  <span className="text-amber-600 font-medium">Waitlist only</span>
                ) : (
                  <span><strong className="text-slate-800">{availableSeats}</strong> of {capacity} seats left</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <Link
          to={`/events/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all mt-1"
        >
          View Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
