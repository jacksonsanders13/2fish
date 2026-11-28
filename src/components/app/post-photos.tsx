"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPostPhotos, removePostPhoto } from "@/lib/pilot/actions";
import type { Post } from "@/lib/pilot/types";
import { checkPhotos } from "@/lib/uploads/check";
import { uploadPhotos } from "@/lib/uploads/prepare";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useDemo } from "./demo";

// The photos in one post: the slideshow so far, the shots Fisher still needs,
// and the button to add them. One photo is a single post; two or more go up
// as a slideshow.
export function PostPhotos({ post }: { post: Post }) {
  const router = useRouter();
  const demo = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const locked = post.status === "posted";
  const room = 10 - post.slides.length;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, room));
    e.target.value = "";
    if (!files.length) return;
    setNotes([]);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setNotes(["Sign in again to add photos."]);

    const up = await uploadPhotos(supabase, `${data.user.id}/posts/${post.id}`, files, (done, total) => setBusy(done < total ? `Getting photo ${done + 1} of ${total} ready…` : "Checking the photos…"));
    const problems = [...up.problems];
    let kept = up.paths;
    if (kept.length) {
      const check = await checkPhotos(kept);
      kept = check.kept;
      problems.push(...check.rejected.map((r) => `One photo was removed: ${r.why}`));
    }
    if (kept.length) {
      const r = await addPostPhotos({ id: post.id, paths: kept });
      if (r.message) problems.unshift(r.message);
    }
    setBusy(null);
    setNotes(problems);
    router.refresh();
  }

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

      {!locked && room > 0 ? (
        demo ? (
          <p className="mt-3 text-sm text-muted-foreground">In the real app you add photos to the post right here.</p>
        ) : (
          <div className="mt-3">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
            <Button size="sm" variant={post.shots.length ? "signal" : "outline"} disabled={Boolean(busy)} onClick={() => fileRef.current?.click()} className="h-10">
              <Camera aria-hidden="true" />
              {busy ?? (post.shots.length ? "Add these photos" : "Add photos")}
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">Photos only. Up to {room} more for this post. Add them in the order above.</p>
          </div>
        )
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
