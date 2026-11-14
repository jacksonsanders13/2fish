"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { auditQuestions } from "@/lib/data";
import { cn, type Dir } from "@/lib/utils";

export function AuditScreen({ dir }: { dir: Dir }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = auditQuestions.length;
  const q = auditQuestions[index];
  const value = answers[q.id] ?? "";
  const last = index === total - 1;
  const canNext = value.trim().length > 0;

  function set(v: string) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }

  function next() {
    if (!canNext) return;
    if (last) router.push(`/${dir}/results`);
    else setIndex(index + 1);
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  // Tapping a choice moves on after a beat, so most questions are one tap.
  function choose(v: string) {
    set(v);
    if (!last) {
      const target = index + 1;
      window.setTimeout(() => setIndex(target), 180);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="border-b border-line">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link href={`/${dir}`} className="rounded-ctl">
            <Logo />
          </Link>
          <span className="text-sm text-muted">Free audit</span>
          <Link href={`/${dir}/results`} className="text-sm text-muted underline underline-offset-2 hover:text-ink">
            Skip to sample results
          </Link>
        </Container>
      </header>

      <div
        className="h-1 bg-line"
        role="progressbar"
        aria-label="Audit progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <div className="h-1 bg-navy transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <main className="flex-1">
        <Container className="max-w-2xl py-10 sm:py-16">
          <p className="num text-sm text-muted">
            Question {index + 1} of {total}
          </p>
          <h1 key={q.id} className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            {q.prompt}
          </h1>
          {q.help ? <p className="mt-2 text-muted">{q.help}</p> : null}

          <div className="mt-8">
            {q.type === "choice" ? (
              <div role="radiogroup" aria-label={q.prompt} className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => {
                  const selected = value === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(o)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-ctl border px-4 py-3 text-left text-[15px] transition-colors",
                        selected ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy",
                      )}
                    >
                      {o}
                      {selected ? <Check size={16} aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {q.type === "number" ? (
              <div className="flex h-14 items-center rounded-ctl border border-line bg-white px-4 text-lg focus-within:border-navy">
                {q.prefix ? <span className="text-muted">{q.prefix}</span> : null}
                <input
                  key={q.id}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  autoFocus
                  placeholder={q.placeholder}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  className="num w-full bg-transparent px-1 outline-none placeholder:text-muted/60"
                  aria-label={q.prompt}
                />
                {q.suffix ? <span className="shrink-0 text-muted">{q.suffix}</span> : null}
              </div>
            ) : null}

            {q.type === "text" ? (
              <textarea
                key={q.id}
                rows={4}
                autoFocus
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full rounded-ctl border border-line bg-white p-4 text-[15px] outline-none placeholder:text-muted/60 focus:border-navy"
                aria-label={q.prompt}
              />
            ) : null}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={index === 0}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </Button>
            <Button onClick={next} disabled={!canNext}>
              {last ? "See my results" : "Next"}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </main>

      <footer>
        <Container className="py-6 text-xs text-muted">Mockup. Your answers aren&apos;t saved yet.</Container>
      </footer>
    </div>
  );
}
