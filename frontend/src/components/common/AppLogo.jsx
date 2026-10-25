import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function AppLogo({ className, variant = "dark" }) {
  const isDark = variant === "dark";

  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 font-bold tracking-tight text-xl transition-opacity hover:opacity-95", className)}>
      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
        <Calendar className="w-4 h-4 stroke-[2.5]" />
      </div>
      <span className={cn(isDark ? "text-slate-900" : "text-white")}>
        Event<span className="text-indigo-600">Ops</span>
      </span>
    </Link>
  );
}
