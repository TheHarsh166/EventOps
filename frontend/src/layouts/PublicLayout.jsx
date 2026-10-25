import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "../components/layout/PublicNavbar.jsx";
import { PublicFooter } from "../components/layout/PublicFooter.jsx";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
