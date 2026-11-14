"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { auditQuestions } from "@/lib/data";
import type { Dir } from "@/lib/format";
import { cn } from "@/lib/utils";

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
          <Link href={`/${dir}`} className="rounded-md">
            <Logo />
          </Link>
          <span className="text-sm font-semibold">Free audit</span>
          <Link href={`/${dir}/results`} className="text-sm underline underline-offset-2">
            Skip to sample results
          </Link>
        </Container>
      </header>

      <Progress value={((index + 1) / total) * 100} aria-label="Audit progress" className="h-1 rounded-none bg-line" />

      <main className="flex-1">
        <Container className="max-w-2xl py-10 sm:py-16">
          <p className="num text-sm font-semibold">
            Question {index + 1} of {total}
          </p>
          <h1 key={q.id} className="mt-3 text-display font-semibold">
            {q.prompt}
          </h1>
          {q.help ? <p className="mt-3 text-muted-foreground">{q.help}</p> : null}

          <div className="mt-8">
            {q.type === "choice" ? (
              <div role="radiogroup" aria-label={q.prompt} className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => {
                  const selected = value === o;
                  return (
                    <Button
                      key={o}
                      variant="outline"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(o)}
                      className={cn(
                        "h-auto justify-between px-4 py-3 text-base font-normal whitespace-normal",
                        selected && "border-navy bg-navy text-white hover:bg-navy-tint hover:text-white",
                      )}
                    >
                      {o}
                      {selected ? <Check aria-hidden="true" /> : null}
                    </Button>
                  );
                })}
              </div>
            ) : null}

            {q.type === "number" ? (
              <div className="flex h-14 items-center rounded-md border border-input bg-white px-4 focus-within:border-navy">
                {q.prefix ? <span className="text-muted-foreground">{q.prefix}</span> : null}
                <Input
                  key={q.id}
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
              </div>
            ) : null}

            {q.type === "text" ? (
              <Textarea
                key={q.id}
                rows={4}
                autoFocus
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="min-h-32 p-4 md:text-base"
                aria-label={q.prompt}
              />
            ) : null}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={index === 0}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button onClick={next} disabled={!canNext}>
              {last ? "See my results" : "Next"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </main>

      <footer>
        <Container className="py-6 text-sm text-muted-foreground">Mockup. Your answers aren&apos;t saved yet.</Container>
      </footer>
    </div>
  );
}
