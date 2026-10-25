import React from "react";
import { User, Mail, Shield, Calendar, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your account profile details, credentials, and role assignments.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2">
              <StatusBadge status={user?.role} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Full Name
            </span>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
              <User className="w-4 h-4 text-slate-400" />
              {user?.name || "Not set"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </span>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
              <Mail className="w-4 h-4 text-slate-400" />
              {user?.email || "Not set"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Role
            </span>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
              <Shield className="w-4 h-4 text-slate-400" />
              {user?.role || "ATTENDEE"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Privileged roles are managed strictly by system administrators.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              User Identifier (ID)
            </span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate">
              {user?.id || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
