"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ease } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { auditQuestions } from "@/lib/data";
import { readAnswers, saveAnswers } from "@/lib/plan/storage";
import { cn } from "@/lib/utils";

export function AuditScreen() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    typeof window === "undefined" ? {} : ((readAnswers() as Record<string, string> | null) ?? {}),
  );

  const total = auditQuestions.length;
  const q = auditQuestions[index];
  const value = answers[q.id] ?? "";
  const last = index === total - 1;
  const canNext = value.trim().length > 0;

  function set(v: string) {
    setAnswers((a) => {
      const next = { ...a, [q.id]: v };
      saveAnswers(next);
      return next;
    });
  }

  function go(to: number) {
    setDirection(to > index ? 1 : -1);
    setIndex(to);
  }

  function next() {
    if (!canNext) return;
    if (last) router.push("/results");
    else go(index + 1);
  }

  function back() {
    if (index > 0) go(index - 1);
  }

  // Tapping a choice moves on after a beat, so most questions are one tap.
  function choose(v: string) {
    set(v);
    if (!last) {
      const target = index + 1;
      window.setTimeout(() => go(target), 320);
    }
  }

  const slide = reduce ? 0 : 48;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="on-night border-b border-on-night-line bg-night text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Free audit</span>
          <Link href="/results" className="text-sm text-white underline underline-offset-2">
            See sample results
          </Link>
        </Container>
      </header>

      <Progress
        value={((index + 1) / total) * 100}
        aria-label="Audit progress"
        className="h-1 rounded-none bg-line [&>[data-slot=progress-indicator]]:bg-signal"
      />

      <main className="flex-1 overflow-x-hidden">
        <Container className="max-w-2xl py-10 sm:py-16">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: slide * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -slide * direction }}
              transition={{ duration: reduce ? 0 : 0.3, ease }}
            >
              <p className="num text-sm font-semibold text-signal">
                Question {index + 1} of {total}
              </p>
              <h1 className="mt-3 text-display font-semibold">{q.prompt}</h1>
              {q.help ? <p className="mt-3 text-muted-foreground">{q.help}</p> : null}

              <div className="mt-8">
                {q.type === "choice" ? (
                  <div role="radiogroup" aria-label={q.prompt} className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, i) => {
                      const selected = value === o;
                      return (
                        <motion.div
                          key={o}
                          initial={reduce ? false : { opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.06 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                        >
                          <Button
                            variant="outline"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => choose(o)}
                            className={cn(
                              "h-auto w-full justify-between px-4 py-3 text-base font-normal whitespace-normal",
                              selected && "border-night bg-night text-white hover:bg-night-tint hover:text-white",
                            )}
                          >
                            {o}
                            {selected ? (
                              <motion.span
                                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                                className="inline-flex"
                              >
                                <Check aria-hidden="true" />
                              </motion.span>
                            ) : null}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : null}

                {q.type === "number" ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.1 }}
                    className="flex h-14 items-center rounded-md border border-input bg-white px-4 focus-within:border-night"
                  >
                    {q.prefix ? <span className="text-muted-foreground">{q.prefix}</span> : null}
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      autoFocus
                      placeholder={q.placeholder}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      className="num h-full border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 md:text-base"
                      aria-label={q.prompt}
                    />
                    {q.suffix ? <span className="shrink-0 text-muted-foreground">{q.suffix}</span> : null}
                  </motion.div>
                ) : null}

                {q.type === "text" ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.1 }}
                  >
                    <Textarea
                      rows={4}
                      autoFocus
                      placeholder={q.placeholder}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="min-h-32 p-4 md:text-base"
                      aria-label={q.prompt}
                    />
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={index === 0}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button variant="signal" onClick={next} disabled={!canNext}>
              {last ? "See my results" : "Next"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </main>

      <footer>
        <Container className="py-6 text-sm text-muted-foreground">Your answers stay on this device until you choose to save your plan.</Container>
      </footer>
    </div>
  );
}
