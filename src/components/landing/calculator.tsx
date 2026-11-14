"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { roundTen, type Dir } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKS = 4.3;
const BOOK_RATE = 0.3;

export function MissedCallCalculator({ dir, className }: { dir: Dir; className?: string }) {
  const [missed, setMissed] = useState(6);
  const [job, setJob] = useState(385);
  const id = useId();

  const monthly = roundTen(missed * WEEKS * job * BOOK_RATE);
  const yearly = monthly * 12;

  return (
    <div className={cn("rounded-lg border border-line bg-white p-5 sm:p-6", className)}>
      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-missed`} className="text-sm font-semibold">
              Calls you miss in a week
            </label>
            <span className="num text-sm font-semibold">{missed}</span>
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
          <label htmlFor={`${id}-job`} className="text-sm font-semibold">
            Average job value
          </label>
          <div className="mt-2 flex h-11 items-center rounded-md border border-input bg-white pl-3 focus-within:border-navy">
            <span className="text-muted-foreground">$</span>
            <Input
              id={`${id}-job`}
              type="number"
              inputMode="numeric"
              min={0}
              value={job}
              onChange={(e) => setJob(Math.max(0, Number(e.target.value)))}
              className="num h-full border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0 md:text-base"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-semibold">Walking out the door each month</p>
        <p className="mt-1 text-display font-semibold">
          <Money amount={monthly} tone="ink" />
        </p>
        <p className="mt-2 text-sm">
          About <Money amount={yearly} tone="ink" className="font-semibold" /> a year. Assumes you&apos;d book 3 of
          every 10 callers you text back.
        </p>
      </div>

      <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
        <Link href={`/${dir}/audit`}>
          Find the rest of the leaks
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
