import React from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../common/AppLogo.jsx";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <AppLogo variant="light" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Better events. Greater impact. Discover, manage, and scale your tech and community conferences seamlessly.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">Explore Events</Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition-colors">Waitlist Management</Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition-colors">PayU Payments</Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-white transition-colors">Organizer Analytics</Link>
              </li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Roles</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/signup?role=ATTENDEE" className="hover:text-white transition-colors">Attendee Registration</Link>
              </li>
              <li>
                <Link to="/signup?role=ORGANIZER" className="hover:text-white transition-colors">Organizer Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Account Login</Link>
              </li>
            </ul>
          </div>

          {/* Platform Information */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">PayU Payment Gateway Verified</li>
              <li className="text-slate-400">Strict Role-Based Authorization</li>
              <li className="text-slate-400">Atomic Seat Reservations</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EventOps. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
