"use client";

import { useState } from "react";
import { Check, Film, Play, Upload } from "lucide-react";
import { AppShell, PageBody } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { uploadedClips, videos } from "@/lib/data";
import { cn, type Dir } from "@/lib/utils";

const tones = {
  navy: "bg-navy text-white",
  sand: "bg-sand text-navy",
  surface: "bg-surface text-navy",
};

export function VideosScreen({ dir }: { dir: Dir }) {
  const [phase, setPhase] = useState<"upload" | "working" | "ready">("upload");
  const [approved, setApproved] = useState<number[]>([]);
  const [scheduled, setScheduled] = useState(false);

  function make() {
    setPhase("working");
    window.setTimeout(() => setPhase("ready"), 1400);
  }

  function toggle(id: number) {
    setApproved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  return (
    <AppShell dir={dir} active="videos">
      <PageBody>
        <header className="max-w-2xl">
          <p className="text-sm text-muted">Plan · Step 4</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">Post 7 short videos a week</h1>
          <p className="mt-3 text-muted">
            Upload the clips you already shoot on jobs. 2fish cuts them into vertical videos with captions, one
            for each day, and posts them on a schedule.
          </p>
        </header>

        {phase !== "ready" ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-line bg-white p-8 text-center sm:p-12">
              <Upload size={24} className="text-muted" aria-hidden="true" />
              <p className="mt-3 font-medium">Drop phone clips here, or choose them</p>
              <p className="mt-1 text-sm text-muted">MOV or MP4. Vertical or sideways, it doesn&apos;t matter.</p>
              <Button variant="secondary" className="mt-5">
                Choose clips
              </Button>
            </div>
            <aside className="rounded-card border border-line bg-white p-5">
              <h2 className="font-medium">Tuesday&apos;s clips</h2>
              <p className="text-sm text-muted">Uploaded from your phone at 4:52 PM</p>
              <ul className="mt-3 divide-y divide-line">
                {uploadedClips.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Film size={15} className="text-muted" aria-hidden="true" />
                      {c.name}
                    </span>
                    <span className="num text-muted">{c.length}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-4 w-full" onClick={make} disabled={phase === "working"}>
                {phase === "working" ? "Cutting your clips…" : "Make my 7 videos"}
              </Button>
              <p className="mt-2 text-xs text-muted" aria-live="polite">
                {phase === "working"
                  ? "Usually takes a few minutes. You'll get a text when they're ready."
                  : "About 5 minutes of footage makes a week of videos."}
              </p>
            </aside>
          </section>
        ) : (
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-4">
              <p className="text-sm">
                <span className="font-medium">7 videos ready.</span>{" "}
                <span className="num text-muted">{approved.length} of 7 approved.</span>
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setApproved(videos.map((v) => v.id))}>
                  Approve all
                </Button>
                <Button size="sm" disabled={approved.length === 0 || scheduled} onClick={() => setScheduled(true)}>
                  {scheduled ? "Scheduled" : "Schedule approved"}
                </Button>
              </div>
            </div>
            {scheduled ? (
              <p role="status" className="mt-3 rounded-card bg-sand px-4 py-3 text-sm">
                Scheduled. The first one posts Monday at 7:30 AM to Facebook and Instagram. You&apos;ll get a text
                each morning when one goes up.
              </p>
            ) : null}

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((v) => {
                const isApproved = approved.includes(v.id);
                return (
                  <li key={v.id} className="overflow-hidden rounded-card border border-line bg-white">
                    <div className={cn("relative flex aspect-[4/5] items-center justify-center", tones[v.tone])}>
                      <span className="flex size-12 items-center justify-center rounded-full bg-white text-navy">
                        <Play size={20} aria-hidden="true" />
                        <span className="sr-only">Play preview</span>
                      </span>
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-xs text-ink">
                        Placeholder thumbnail
                      </span>
                      <span className="num absolute right-3 bottom-3 rounded bg-navy px-1.5 py-0.5 text-xs text-white">
                        {v.length}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{v.day} · 7:30 AM</span>
                        {isApproved ? (
                          <span className="flex items-center gap-1 font-medium text-navy">
                            <Check size={14} aria-hidden="true" />
                            Approved
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-medium leading-snug">{v.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{v.caption}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant={isApproved ? "secondary" : "primary"} onClick={() => toggle(v.id)}>
                          {isApproved ? "Undo" : "Approve"}
                        </Button>
                        <Button size="sm" variant="ghost">
                          Edit caption
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </PageBody>
    </AppShell>
  );
}
