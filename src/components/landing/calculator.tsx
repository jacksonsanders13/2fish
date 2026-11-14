"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { cn, roundTen, type Dir } from "@/lib/utils";

const WEEKS = 4.3;
const BOOK_RATE = 0.3;

export function MissedCallCalculator({ dir, className }: { dir: Dir; className?: string }) {
  const [missed, setMissed] = useState(6);
  const [job, setJob] = useState(385);
  const id = useId();

  const monthly = roundTen(missed * WEEKS * job * BOOK_RATE);
  const yearly = monthly * 12;

  return (
    <div className={cn("rounded-card border border-line bg-white p-5 sm:p-6", className)}>
      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-missed`} className="text-sm font-medium">
              Calls you miss in a week
            </label>
            <span className="num text-sm text-muted">{missed}</span>
          </div>
          <input
            id={`${id}-missed`}
            type="range"
            min={0}
            max={25}
            value={missed}
            onChange={(e) => setMissed(Number(e.target.value))}
            className="mt-3"
          />
        </div>
        <div>
          <label htmlFor={`${id}-job`} className="text-sm font-medium">
            Average job value
          </label>
          <div className="mt-2 flex h-11 items-center rounded-ctl border border-line bg-white px-3 focus-within:border-navy">
            <span className="text-muted">$</span>
            <input
              id={`${id}-job`}
              type="number"
              inputMode="numeric"
              min={0}
              value={job}
              onChange={(e) => setJob(Math.max(0, Number(e.target.value)))}
              className="num w-full bg-transparent pl-1 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-muted">Walking out the door each month</p>
        <p className="mt-1 font-display text-4xl leading-none tracking-tight sm:text-5xl">
          <Money amount={monthly} tone="ink" />
        </p>
        <p className="mt-2 text-sm text-muted">
          About <Money amount={yearly} tone="ink" className="font-medium" /> a year. Assumes you&apos;d book 3 of
          every 10 callers you text back.
        </p>
      </div>

      <Button href={`/${dir}/audit`} className="mt-5 w-full sm:w-auto">
        Find the rest of the leaks
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
