import React, { useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { AppLogo } from "../components/common/AppLogo.jsx";

export function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview", href: "/organizer", icon: LayoutDashboard },
    { label: "My Events", href: "/organizer/events", icon: Calendar },
    { label: "Registrations", href: "/organizer/registrations", icon: Users },
    { label: "Waitlist", href: "/organizer/waitlist", icon: Clock },
    { label: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
    { label: "Notifications", href: "/organizer/notifications", icon: Bell },
    { label: "Profile", href: "/organizer/profile", icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Navy Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#111827] text-[#CBD5E1] border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Link to="/organizer" className="flex items-center gap-2 text-white">
            <AppLogo />
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-4">
          <Link
            to="/organizer/events/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/organizer"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 font-semibold flex items-center justify-center text-sm shrink-0 border border-indigo-500/30">
              {user?.name?.[0]?.toUpperCase() || "O"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">Organizer</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-[#111827] text-[#CBD5E1] p-4 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <AppLogo />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <Link
                to="/organizer/events/new"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/organizer"}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar on small devices */}
        <div className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <AppLogo />
          <div className="w-8" />
        </div>

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
