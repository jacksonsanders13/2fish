"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Film, Play, Upload } from "lucide-react";
import { AppShell, PageBody } from "@/components/app/shell";
import { ease, Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uploadedClips, videos } from "@/lib/data";
import { cn } from "@/lib/utils";

const tones = {
  night: "bg-night text-white",
  surface: "bg-surface text-ink",
};

export function VideosScreen({ email }: { email?: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"upload" | "working" | "ready">("upload");
  const [approved, setApproved] = useState<number[]>([]);
  const [scheduled, setScheduled] = useState(false);

  function make() {
    setPhase("working");
    window.setTimeout(() => setPhase("ready"), 1800);
  }

  function toggle(id: number) {
    setApproved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  return (
    <AppShell active="videos" email={email}>
      <PageBody>
        <Reveal immediate y={16}>
          <header className="max-w-2xl">
            <h1 className="text-display font-semibold">7 posts a week from your photos</h1>
            <p className="mt-3">
              Send the product photos and try-on clips you already take. Every Monday 2fish turns them into 7
              posts with captions, each with its own promo code.
            </p>
            <p className="mt-4 rounded-md bg-night px-4 py-3 text-sm text-white">
              <strong>Coming soon.</strong> This is what it will look like, using samples from Linden Row, a
              made-up boutique. Nothing here touches your account yet.
            </p>
          </header>
        </Reveal>

        <AnimatePresence mode="wait" initial={false}>
          {phase !== "ready" ? (
            <motion.section
              key="upload"
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={{ duration: 0.3, ease }}
              className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-white p-8 text-center sm:p-12">
                <Upload size={24} aria-hidden="true" />
                <p className="mt-3 font-semibold">Drop photos and clips here, or choose them</p>
                <p className="mt-1 text-sm">Photos or short videos straight from your phone.</p>
                <Button variant="outline" className="mt-5">
                  Choose photos or clips
                </Button>
              </div>
              <aside className="rounded-lg border border-line bg-white p-5">
                <h2 className="font-semibold">Sample upload</h2>
                <p className="text-sm text-muted-foreground">What a Monday upload from your phone looks like</p>
                <ul className="mt-3 divide-y divide-line">
                  {uploadedClips.map((c, i) => (
                    <Reveal as="li" key={c.name} delay={i * 0.05} y={6} className="flex items-center justify-between py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <Film size={15} aria-hidden="true" />
                        {c.name}
                      </span>
                      <span className="num text-muted-foreground">{c.length}</span>
                    </Reveal>
                  ))}
                </ul>
                <Button className="mt-4 w-full" onClick={make} disabled={phase === "working"}>
                  {phase === "working" ? "Making your posts…" : "Make my 7 posts"}
                </Button>
                {phase === "working" ? (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <motion.div
                      className="h-full w-1/3 rounded-full bg-night"
                      initial={{ x: "-100%" }}
                      animate={{ x: "300%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                  {phase === "working"
                    ? "Usually takes a few minutes."
                    : "About 10 photos or a few short clips make a week of posts."}
                </p>
              </aside>
            </motion.section>
          ) : (
            <motion.section
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4">
                <p className="text-sm">
                  <span className="font-semibold">7 posts ready.</span>{" "}
                  <span className="num">{approved.length} of 7 approved.</span>
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setApproved(videos.map((v) => v.id))}>
                    Approve all
                  </Button>
                  <Button size="sm" disabled={approved.length === 0 || scheduled} onClick={() => setScheduled(true)}>
                    {scheduled ? "Scheduled" : "Schedule approved"}
                  </Button>
                </div>
              </div>
              <AnimatePresence>
                {scheduled ? (
                  <motion.p
                    role="status"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden rounded-lg border border-night bg-white px-4 py-3 text-sm"
                  >
                    Scheduled. The first one posts Monday at 7:30 AM to Facebook and Instagram. You&apos;ll get a
                    text each morning when one goes up.
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((v, i) => {
                  const isApproved = approved.includes(v.id);
                  return (
                    <motion.li
                      key={v.id}
                      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease, delay: reduce ? 0 : 0.1 + i * 0.1 }}
                      className="overflow-hidden rounded-lg border border-line bg-white"
                    >
                      <div className={cn("relative flex aspect-[4/5] items-center justify-center", tones[v.tone])}>
                        <span className="flex size-12 items-center justify-center rounded-full bg-white text-night transition-transform hover:scale-105">
                          <Play size={20} aria-hidden="true" />
                          <span className="sr-only">Play preview</span>
                        </span>
                        <Badge
                          variant="outline"
                          className="absolute top-3 left-3 rounded-full bg-white text-sm font-medium text-ink"
                        >
                          Placeholder thumbnail
                        </Badge>
                        <span className="num absolute right-3 bottom-3 rounded-md bg-night px-1.5 py-0.5 text-sm text-white">
                          {v.length}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex h-5 items-center justify-between text-sm">
                          <span className="text-muted-foreground">{v.day} · 7:30 AM</span>
                          <AnimatePresence>
                            {isApproved ? (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="flex items-center gap-1 font-semibold text-night"
                              >
                                <Check size={14} aria-hidden="true" />
                                Approved
                              </motion.span>
                            ) : null}
                          </AnimatePresence>
                        </div>
                        <h3 className="mt-1 font-semibold">{v.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm">{v.caption}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant={isApproved ? "outline" : "default"} onClick={() => toggle(v.id)}>
                            {isApproved ? "Undo" : "Approve"}
                          </Button>
                          <Button size="sm" variant="ghost">
                            Edit caption
                          </Button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>
      </PageBody>
    </AppShell>
  );
}
