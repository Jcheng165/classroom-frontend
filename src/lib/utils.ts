/**
 * Small UI-agnostic utilities.
 *
 * `cn` is a common Tailwind + className merge helper used across components.
 */
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional classNames safely (dedupe tailwind conflicts).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
