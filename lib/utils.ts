import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "0.0";
  return value.toFixed(digits);
}

export function formatReviewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "0";
  return new Intl.NumberFormat("en-IT").format(Math.trunc(count));
}

export function formatCurrencyEUR(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  if (!Number.isFinite(value)) return "€0";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}