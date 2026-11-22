"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedMoney } from "@/components/motion/animated-money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roundTen } from "@/lib/format";

const WEEKS = 4.3;
// A guess, and the page says so: one extra sale for every two posts.
// The proof report replaces it with the store's real number.
const SALES_PER_POST = 0.5;

export function PostsCalculator({ className }: { className?: string }) {
  const [posts, setPosts] = useState(7);
  const [sale, setSale] = useState(68);
  const id = useId();

  const monthly = roundTen(posts * WEEKS * SALES_PER_POST * sale);
  const yearly = monthly * 12;

  return (
    <div className={className}>
      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-posts`} className="text-sm font-semibold">
              Posts a week
            </label>
            <span className="num text-sm font-semibold">{posts}</span>
          </div>
          <input
            id={`${id}-posts`}
            type="range"
            min={0}
            max={14}
            value={posts}
            onChange={(e) => setPosts(Number(e.target.value))}
            className="mt-3"
          />
        </div>
        <div>
          <label htmlFor={`${id}-sale`} className="text-sm font-semibold">
            Average sale in your store
          </label>
          <div className="mt-2 flex h-11 items-center rounded-md border border-input bg-white pl-3 focus-within:border-night">
            <span className="text-muted-foreground">$</span>
            <Input
              id={`${id}-sale`}
              type="number"
              inputMode="numeric"
              min={0}
              value={sale}
              onChange={(e) => setSale(Math.max(0, Number(e.target.value)))}
              className="num h-full border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0 md:text-base"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold">What those posts could bring in each month</p>
        <p className="mt-1 text-display font-semibold">
          <AnimatedMoney amount={monthly} tone="ink" duration={0.6} />
        </p>
        <p className="mt-2 text-sm">
          About <AnimatedMoney amount={yearly} tone="ink" duration={0.6} className="font-semibold" /> a year.
          Assumes one extra sale for every two posts. Your proof report shows the real number.
        </p>
      </div>

      <Button asChild size="lg" variant="signal" className="mt-5 w-full sm:w-auto">
        <Link href="/audit">
          Get my free store grade
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
