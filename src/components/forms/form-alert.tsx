import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

// Top-of-form message for a server action result.
export function FormAlert({ state, className }: { state: ActionResult<unknown>; className?: string }) {
  if (state.ok && state.message) {
    return (
      <div
        role="status"
        className={cn("flex items-start gap-2 rounded-lg border border-success/40 bg-success-soft px-3 py-2 text-sm text-foreground", className)}
      >
        <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
        {state.message}
      </div>
    );
  }
  if (!state.ok && state.error) {
    return (
      <div
        role="alert"
        className={cn("flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground", className)}
      >
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        {state.error}
      </div>
    );
  }
  return null;
}

export function fieldError(state: ActionResult<unknown>, name: string) {
  if (state.ok) return undefined;
  const msgs = state.fieldErrors?.[name];
  return msgs?.length ? msgs.map((m) => ({ message: m })) : undefined;
}

export function fieldValue(state: ActionResult<unknown>, name: string, fallback = "") {
  if (state.ok) return fallback;
  return state.values?.[name] ?? fallback;
}
