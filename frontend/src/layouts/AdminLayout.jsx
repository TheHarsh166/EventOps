import React, { useState } from "react";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Calendar,
  IndianRupee,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { AppLogo } from "../components/common/AppLogo.jsx";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Event Management", href: "/admin/events", icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Navy Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2 text-white">
            <AppLogo />
          </Link>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
            ADMIN
          </span>
        </div>

        {/* System Notice */}
        <div className="p-3 mx-3 my-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-snug">
          🛡️ Authorized Administrator Session with root-level platform visibility.
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}

          <div className="pt-4 border-t border-slate-800/60 my-2">
            <span className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Quick Links
            </span>
            <Link
              to="/events"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 mt-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <span>Explore Events Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 font-semibold flex items-center justify-center text-sm shrink-0 border border-red-500/30">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">Administrator</p>
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

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-[#0F172A] text-slate-300 p-4 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AppLogo />
                <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 pt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/admin"}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white font-semibold"
                          : "text-slate-400 hover:text-white"
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
              className="mt-auto flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <AppLogo />
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              ADMIN
            </span>
          </div>
          <div className="w-8" />
        </div>

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
