import React, { useEffect, useState, useMemo } from "react";
import { Search, MapPin, Calendar, Filter, AlertCircle, RefreshCw } from "lucide-react";
import { EventCard } from "../../components/events/EventCard.jsx";
import { eventService } from "../../services/event.service.js";
import { Button } from "../../components/common/Button.jsx";

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters supported by actual backend event model
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_ASC");

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getPublishedEvents();
      setEvents(data);
    } catch (err) {
      setError("Unable to load events. Please ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Compute unique locations available in real events
  const availableLocations = useMemo(() => {
    const locs = events
      .map((e) => e.location?.trim())
      .filter((loc) => Boolean(loc));
    return ["ALL", ...new Set(locs)];
  }, [events]);

  // Client-side filtering & sorting against real data
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        const matchesQuery =
          !searchQuery ||
          evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evt.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation =
          locationFilter === "ALL" ||
          evt.location?.toLowerCase() === locationFilter.toLowerCase();

        return matchesQuery && matchesLocation;
      })
      .sort((a, b) => {
        if (sortBy === "DATE_ASC") {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        if (sortBy === "DATE_DESC") {
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        }
        if (sortBy === "PRICE_ASC") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        return 0;
      });
  }, [events, searchQuery, locationFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Explore Events</h1>
        <p className="text-sm text-slate-600 mt-1">
          Discover conferences, workshops, and meetups. Register or join waitlists instantly.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Location Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "ALL" ? "All Locations" : loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="DATE_ASC">Earliest First</option>
              <option value="DATE_DESC">Latest First</option>
              <option value="PRICE_ASC">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content states */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-semibold text-red-900">{error}</h3>
          <Button variant="secondary" size="sm" onClick={fetchEvents} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-slate-900">No events matched your search</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or reset location filters.
          </p>
          {(searchQuery || locationFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
