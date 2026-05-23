/**
 * Utility functions for CSS class composition and data formatting.
 * @module utils
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names, resolving conflicts with `tailwind-merge`.
 * @param inputs - Class name values accepted by `clsx`.
 * @returns A single deduplicated class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string to a localised Indonesian date (e.g. "15 Januari 2024").
 * @param dateStr - ISO date string such as `"2024-01-15"` or `"2024-01-15T10:00:00Z"`.
 * @returns Human-readable date string in Indonesian locale.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a numeric value as a percentage string with one decimal place.
 * @param value - Numeric percentage value (e.g. `87.3`).
 * @returns Formatted string such as `"87.3%"`.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format a numeric work-hour value, returning an em dash for absent values.
 * @param value - Total working hours (may be `null` when not yet calculated).
 * @returns Formatted string such as `"7.5 jam"`, or `"\u2014"` when `value` is nullish.
 */
export function formatHours(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value.toFixed(1)} jam`;
}

/**
 * Map a {@link DayColor} code to its Indonesian label and shadcn/ui badge variant.
 * @param code - Day colour code: `"G"` (Normal), `"Y"` (Sibuk), `"R"` (Puncak).
 * @returns An object with `label` and `variant` suitable for a Badge component.
 */
export function dayColorLabel(code: string): { label: string; variant: "default" | "secondary" | "destructive" } {
  switch (code) {
    case "Y":
      return { label: "Sibuk", variant: "secondary" };
    case "R":
      return { label: "Puncak", variant: "destructive" };
    default:
      return { label: "Normal", variant: "default" };
  }
}
