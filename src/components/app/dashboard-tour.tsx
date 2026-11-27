"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// A short walk-through the first time someone opens the dashboard. Each step
// dims the page, cuts a window around one part of it and explains that part in
// a small card. It remembers it was seen in this browser; the "How it works"
// link brings it back.

export type TourTab = "sales" | "posts" | "chat";
type Step = { target?: string; tab?: TourTab; title: string; body: string };

const SEEN = "2fish_tour_seen";
const PAD = 6; // breathing room around the highlighted part
const CARD_W = 340;

export function tourSeen() {
  try {
    return window.localStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN, "1");
  } catch {
    // Private windows can block storage. The tour just shows again next time.
  }
}

export function DashboardTour({
  open,
  onClose,
  onTab,
  nextStep,
}: {
  open: boolean;
  onClose: () => void;
  onTab: (t: TourTab) => void;
  nextStep?: string; // the label of the next setup step, if there is one
}) {
  const steps: Step[] = [
    {
      title: "Your dashboard in 30 seconds",
      body: "This is where you see what your posts sold, okay the posts Fisher makes, and ask him for more. Four quick stops.",
    },
    ...(nextStep
      ? [
          {
            target: "start",
            title: "Start here",
            body: `This line always shows the next thing to do. Right now that's "${nextStep}". The dots show how far along you are.`,
          },
        ]
      : []),
    {
      target: "sales",
      tab: "sales",
      title: "Sales vs. posts",
      body: "Each week, what the items in your posts sold next to everything else in the store. Connect Square and it fills in by itself.",
    },
    {
      target: "posts",
      tab: "posts",
      title: "Your posts",
      body: "Posts Fisher writes wait here for your okay. Tap one to see the photo and caption, move its date, or approve it. Calendar shows when each one goes up.",
    },
    {
      target: "chat",
      tab: "chat",
      title: "Fisher, your marketing helper",
      body: "Ask him for next week's posts, a poster for a sale, or what's selling. He makes it and you approve it. Nothing goes out without your okay.",
    },
  ];

  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [wide, setWide] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  const close = useCallback(() => {
    markSeen();
    setI(0);
    onClose();
  }, [onClose]);

  // On phones the parts live on tabs, so switch to the right one first.
  useEffect(() => {
    if (open && step.tab) onTab(step.tab);
  }, [open, step.tab, onTab]);

  // Find the highlighted part, and follow it if the window changes size.
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      setWide(window.innerWidth >= 1024);
      const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
      setRect(el && el.offsetParent !== null ? el.getBoundingClientRect() : null);
    };
    // Wait a frame so a tab switch has painted.
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [open, step.target]);

  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, steps.length]);

  if (!open) return null;

  // Put the card beside the highlighted part on a laptop, at the bottom on a phone.
  let cardStyle: React.CSSProperties | undefined;
  if (rect && wide) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const roomRight = vw - rect.right;
    const left = roomRight > CARD_W + 32 ? rect.right + 16 : rect.left > CARD_W + 32 ? rect.left - CARD_W - 16 : Math.min(rect.left, vw - CARD_W - 16);
    const besideIt = roomRight > CARD_W + 32 || rect.left > CARD_W + 32;
    const top = besideIt ? Math.min(Math.max(rect.top, 16), vh - 240) : Math.min(rect.bottom + 16, vh - 240);
    cardStyle = { position: "fixed", left, top, width: CARD_W };
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="tour-h">
      {rect ? (
        // The dim layer is one big shadow around a window over the highlighted part.
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-lg transition-[top,left,width,height] duration-200 ease-out"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 2px var(--color-signal), 0 0 0 9999px rgb(15 23 26 / 0.55)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-[rgb(15_23_26/0.55)]" />
      )}
      {/* Clicking outside the card does nothing, so nobody loses the tour by accident. */}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        ref={cardRef}
        tabIndex={-1}
        style={cardStyle}
        className={
          cardStyle
            ? "rounded-lg bg-white p-5 shadow-lg outline-none"
            : rect
              ? "fixed inset-x-4 bottom-24 rounded-lg bg-white p-5 shadow-lg outline-none sm:inset-x-auto sm:right-6 sm:w-[340px]"
              : "fixed top-1/2 left-1/2 w-[min(340px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-lg outline-none"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <p className="num text-sm text-muted-foreground">
            {i + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={close}
            className="-m-1 flex items-center gap-1 rounded-md p-1 text-sm text-muted-foreground hover:text-night focus-visible:outline-2 focus-visible:outline-signal"
          >
            <X size={16} aria-hidden="true" />
            Skip
          </button>
        </div>
        <h2 id="tour-h" className="mt-2 font-display text-xl text-night">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {steps.map((s, n) => (
              <span key={s.title} className={n === i ? "h-1.5 w-4 rounded-full bg-night" : "size-1.5 rounded-full bg-line"} />
            ))}
          </span>
          <div className="flex gap-2">
            {i > 0 ? (
              <Button size="sm" variant="ghost" className="h-9" onClick={() => setI(i - 1)}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
            ) : null}
            <Button size="sm" variant="signal" className="h-9" onClick={() => (last ? close() : setI(i + 1))}>
              {last ? "Got it" : i === 0 ? "Show me" : "Next"}
              {last ? null : <ArrowRight aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
