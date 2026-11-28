"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { removePostPhoto } from "@/lib/pilot/actions";
import type { Post } from "@/lib/pilot/types";
import { cn } from "@/lib/utils";
import { useDemo } from "./demo";

// The photos in one post: the slideshow so far and the shots Fisher still
// needs. New photos come in through Fisher's chat. One photo is a single post;
// two or more go up as a slideshow.
export function PostPhotos({ post }: { post: Post }) {
  const router = useRouter();
  const demo = useDemo();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const locked = post.status === "posted";

  async function remove(path: string) {
    setBusy("Removing…");
    const r = await removePostPhoto({ id: post.id, path });
    setBusy(null);
    if (!r.ok) setNotes([r.message ?? "Couldn't remove it."]);
    router.refresh();
  }

  return (
    <div>
      {post.slides.length ? (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            {post.slides.length === 1 ? "One photo" : `Slideshow, ${post.slides.length} photos. Swipe to see them all.`}
          </p>
          <ol className="flex snap-x gap-2 overflow-x-auto pb-1">
            {post.slides.map((s, i) => (
              <li key={s.path} className={cn("relative shrink-0 snap-start", post.slides.length === 1 ? "w-full" : "w-40")}>
                {s.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.url} alt={`Slide ${i + 1} for ${post.title}`} className={cn("w-full rounded-md bg-surface object-cover", post.slides.length === 1 ? "max-h-80 object-contain" : "aspect-[4/5]")} />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center rounded-md bg-surface text-sm text-muted-foreground">Photo</div>
                )}
                <span className="num absolute top-1.5 left-1.5 rounded-[4px] bg-white/90 px-1.5 text-xs font-semibold text-night">{i + 1}</span>
                {!locked && !demo ? (
                  <button
                    type="button"
                    onClick={() => void remove(s.path)}
                    disabled={Boolean(busy)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute top-1 right-1 rounded-md bg-white/90 p-1 text-night hover:bg-white focus-visible:outline-2 focus-visible:outline-signal"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
        </>
      ) : !post.shots.length ? (
        <p className="rounded-md bg-surface p-4 text-sm text-muted-foreground">No photo for this post yet.</p>
      ) : null}

      {post.shots.length && !locked ? (
        <div className="mt-3 rounded-md border border-signal/30 bg-signal-soft/40 p-3">
          <p className="text-sm font-semibold text-night">
            Fisher needs {post.shots.length === 1 ? "one more photo" : `${post.shots.length} more photos`}
          </p>
          <ol className="mt-2 space-y-1 text-sm">
            {post.shots.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="num w-4 shrink-0 text-muted-foreground">{post.slides.length + i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {!locked && post.shots.length ? (
        <p className="mt-2 text-sm text-muted-foreground">Take these on your phone and send them to Fisher with the Photos button in the chat. Fisher puts them on this post.</p>
      ) : null}

      {notes.length ? (
        <ul role="status" className="mt-2 space-y-1 text-sm">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
