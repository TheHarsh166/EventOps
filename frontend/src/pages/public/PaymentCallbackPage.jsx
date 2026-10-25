import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Ticket } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";

export function PaymentCallbackPage({ status }) {
  const isSuccess = status === "success";

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg animate-in fade-in zoom-in-95">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSuccess
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {isSuccess ? "Payment Successful!" : "Payment Not Completed"}
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {isSuccess
            ? "Your payment was verified by PayU and your event registration has been confirmed. You can view your pass and ticket anytime."
            : "The payment transaction could not be processed or was cancelled. If money was debited, your bank will auto-reconcile within 3-5 business days."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/app/registrations">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              View My Registrations
            </Button>
          </Link>

          <Link to="/app">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
