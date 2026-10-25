import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return "TBD";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "TBD";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(d);
  } catch {
    return "TBD";
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return "TBD";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "TBD";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(d);
  } catch {
    return "TBD";
  }
}

export function formatCurrency(amount) {
  const num = Number(amount ?? 0);
  if (num === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
}
