import React from "react";
import { cn } from "../../utils/cn.js";

export function StatusBadge({ status, className }) {
  const normalized = (status || "").toUpperCase();

  const config = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PAYMENT_PENDING: "bg-indigo-50 text-indigo-700 border-indigo-200",
    WAITLISTED: "bg-purple-50 text-purple-700 border-purple-200",
    WAITING: "bg-purple-50 text-purple-700 border-purple-200",
    CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const style = config[normalized] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase",
        style,
        className
      )}
    >
      {normalized.replace("_", " ")}
    </span>
  );
}
