"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { movePost, setPostStatus } from "@/lib/pilot/actions";
import { todayIn } from "@/lib/pilot/dates";
import type { Post } from "@/lib/pilot/types";

const STATUS = { draft: "Waiting on your okay", approved: "Approved, goes up on its day", posted: "Posted" } as const;

function longDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

// The pop-up for one post: what goes up, the caption, the campaign it belongs
// to, and the buttons to okay it or move it to another day.
export function PostDialog({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (post && !d.open) d.showModal();
    if (!post && d.open) d.close();
    setError(null);
    setCopied(false);
  }, [post]);

  function run(fn: () => Promise<{ ok: boolean; message?: string }>, close = false) {
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.message ?? "That didn't save. Try again.");
      else if (close) onClose();
    });
  }

  async function copy() {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
    } catch {
      setError("Couldn't copy. Press and hold the caption to copy it.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="post-dialog-h"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg bg-white p-0 text-ink backdrop:bg-ink/60"
    >
      {post ? (
        <div className="max-h-[85dvh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3 p-4 pb-0 sm:p-5 sm:pb-0">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {longDate(post.postOn)} · {post.kind}
              </p>
              <h2 id="post-dialog-h" className="mt-0.5 font-semibold text-night">
                {post.title}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="-m-1 shrink-0 rounded-md p-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-signal" aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {post.mediaUrl ? (
              post.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.mediaUrl} alt={`Photo for ${post.title}`} className="max-h-80 w-full rounded-md bg-surface object-contain" />
              ) : (
                <video src={post.mediaUrl} controls playsInline className="max-h-80 w-full rounded-md bg-ink" />
              )
            ) : (
              <p className="rounded-md bg-surface p-4 text-sm text-muted-foreground">No photo picked for this post yet.</p>
            )}

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold">Opening line</dt>
                <dd className="mt-0.5">{post.hook}</dd>
              </div>
              <div>
                <dt className="font-semibold">Caption</dt>
                <dd className="mt-0.5 whitespace-pre-line">{post.caption}</dd>
              </div>
              <div>
                <dt className="font-semibold">Campaign</dt>
                <dd className="mt-0.5">{post.campaign ? <span className="rounded-[4px] bg-signal-soft px-1.5 py-0.5 font-semibold text-signal-tint">{post.campaign}</span> : "Not part of a campaign"}</dd>
              </div>
              {post.items.length ? (
                <div>
                  <dt className="font-semibold">Items it features</dt>
                  <dd className="mt-0.5">{post.items.join(", ")}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold">Status</dt>
                <dd className="mt-0.5">{STATUS[post.status]}</dd>
              </div>
            </dl>

            {post.status !== "posted" ? (
              <div className="mt-4">
                <label htmlFor="post-day" className="text-sm font-semibold">
                  Post it on
                </label>
                <input
                  id="post-day"
                  type="date"
                  defaultValue={post.postOn}
                  min={todayIn(Intl.DateTimeFormat().resolvedOptions().timeZone)}
                  disabled={pending}
                  onChange={(e) => e.target.value && run(() => movePost({ id: post.id, postOn: e.target.value }))}
                  className="num mt-1 block h-11 rounded-md border border-input bg-white px-3 text-sm"
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="mt-3 text-sm text-signal-tint">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {post.status === "draft" ? (
                <Button variant="signal" disabled={pending} onClick={() => run(() => setPostStatus({ id: post.id, status: "approved" }), true)} className="h-11">
                  <Check aria-hidden="true" />
                  Approve
                </Button>
              ) : null}
              {post.status === "approved" ? (
                <Button variant="outline" disabled={pending} onClick={() => run(() => setPostStatus({ id: post.id, status: "posted" }), true)} className="h-11">
                  Mark as posted
                </Button>
              ) : null}
              <Button variant="outline" onClick={copy} className="h-11">
                <Copy aria-hidden="true" />
                {copied ? "Copied" : "Copy caption"}
              </Button>
              <Button asChild variant="ghost" className="h-11">
                <Link href={`/dashboard/videos?week=${post.weekOf}`}>Edit</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
