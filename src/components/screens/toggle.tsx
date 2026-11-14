"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className="flex items-center gap-2 text-sm"
    >
      <span className={cn("relative h-6 w-10 rounded-full transition-colors", on ? "bg-navy" : "bg-line")}>
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-[left]",
            on ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
      <span className="font-medium">{on ? "On" : "Off"}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
