"use client";

import { useState } from "react";
import { Check, Film, Play, Upload } from "lucide-react";
import { AppShell, PageBody } from "@/components/app/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uploadedClips, videos } from "@/lib/data";
import type { Dir } from "@/lib/format";
import { cn } from "@/lib/utils";

const tones = {
  navy: "bg-navy text-white",
  surface: "bg-surface text-ink",
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
          <p className="text-sm text-muted-foreground">Plan · Step 4</p>
          <h1 className="mt-1 text-display font-semibold">Post 7 short videos a week</h1>
          <p className="mt-3">
            Upload the clips you already shoot on jobs. 2fish cuts them into vertical videos with captions, one
            for each day, and posts them on a schedule.
          </p>
        </header>

        {phase !== "ready" ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-white p-8 text-center sm:p-12">
              <Upload size={24} aria-hidden="true" />
              <p className="mt-3 font-semibold">Drop phone clips here, or choose them</p>
              <p className="mt-1 text-sm">MOV or MP4. Vertical or sideways, it doesn&apos;t matter.</p>
              <Button variant="outline" className="mt-5">
                Choose clips
              </Button>
            </div>
            <aside className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-semibold">Tuesday&apos;s clips</h2>
              <p className="text-sm text-muted-foreground">Uploaded from your phone at 4:52 PM</p>
              <ul className="mt-3 divide-y divide-line">
                {uploadedClips.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Film size={15} aria-hidden="true" />
                      {c.name}
                    </span>
                    <span className="num text-muted-foreground">{c.length}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-4 w-full" onClick={make} disabled={phase === "working"}>
                {phase === "working" ? "Cutting your clips…" : "Make my 7 videos"}
              </Button>
              <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                {phase === "working"
                  ? "Usually takes a few minutes. You'll get a text when they're ready."
                  : "About 5 minutes of footage makes a week of videos."}
              </p>
            </aside>
          </section>
        ) : (
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4">
              <p className="text-sm">
                <span className="font-semibold">7 videos ready.</span>{" "}
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
            {scheduled ? (
              <p role="status" className="mt-3 rounded-lg border border-navy bg-white px-4 py-3 text-sm">
                Scheduled. The first one posts Monday at 7:30 AM to Facebook and Instagram. You&apos;ll get a text
                each morning when one goes up.
              </p>
            ) : null}

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((v) => {
                const isApproved = approved.includes(v.id);
                return (
                  <li key={v.id} className="overflow-hidden rounded-lg border border-line bg-white">
                    <div className={cn("relative flex aspect-[4/5] items-center justify-center", tones[v.tone])}>
                      <span className="flex size-12 items-center justify-center rounded-full bg-white text-navy">
                        <Play size={20} aria-hidden="true" />
                        <span className="sr-only">Play preview</span>
                      </span>
                      <Badge variant="outline" className="absolute top-3 left-3 rounded-full bg-white text-sm font-medium text-ink">
                        Placeholder thumbnail
                      </Badge>
                      <span className="num absolute right-3 bottom-3 rounded-md bg-navy px-1.5 py-0.5 text-sm text-white">
                        {v.length}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{v.day} · 7:30 AM</span>
                        {isApproved ? (
                          <span className="flex items-center gap-1 font-semibold text-navy">
                            <Check size={14} aria-hidden="true" />
                            Approved
                          </span>
                        ) : null}
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
