"use client";

import { useEffect, useRef, useState } from "react";
import { Money } from "@/components/ui/money";

type Props = React.ComponentProps<typeof Money> & { duration?: number; delay?: number };

// Ease-out that lands softly, close to the curve the rest of the site uses.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

// Counts up to the amount the first time it scrolls into view, and tweens
// between values after that (the calculator uses this). Plain browser APIs on
// purpose: the landing page shouldn't ship the whole motion library for this.
export function AnimatedMoney({ amount, duration = 1.2, delay = 0, ...rest }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [shown, setShown] = useState(amount);
  const from = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    from.current = amount;
    if (reduce || start === amount) {
      setShown(amount);
      return;
    }
    const wait = start === 0 ? delay * 1000 : 0;
    const ms = duration * 1000;
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now + wait;
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      setShown(Math.round(start + (amount - start) * easeOut(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amount, inView, duration, delay]);

  return (
    // The invisible copy holds the final width so the count-up doesn't nudge
    // the words around it.
    <span ref={ref} className="relative inline-block">
      <span aria-hidden="true" className="invisible">
        <Money amount={amount} {...rest} />
      </span>
      <span className="absolute inset-0">
        <Money amount={inView ? shown : amount} {...rest} />
      </span>
    </span>
  );
}
