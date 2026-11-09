import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Joins class names and lets later Tailwind classes win over earlier ones.
// Only used inside src/components/ui to combine variant classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
