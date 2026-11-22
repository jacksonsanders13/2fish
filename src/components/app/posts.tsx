"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Check, Copy, Download, Film, Pencil, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveWeek, makePack, removeUpload, setPostStatus, updatePost } from "@/lib/pilot/actions";
import { shortDate } from "@/lib/pilot/dates";
import type { Post, Upload as UploadFile } from "@/lib/pilot/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILES = 20;

// The weekly pack: send photos, say what's new, get 7 posts, approve, then copy each one out.
export function PostsView({ userId, weekOf, uploads, posts }: { userId: string; weekOf: string; uploads: UploadFile[]; posts: Post[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const approved = posts.filter((p) => p.status !== "draft").length;
  const locked = approved > 0;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, MAX_FILES - uploads.length));
    e.target.value = "";
    if (!files.length) return;
    const supabase = createClient();
    for (const [i, f] of files.entries()) {
      setUploading(`Uploading ${i + 1} of ${files.length}…`);
      const path = `${userId}/pack/${weekOf}/${Date.now()}-${f.name.replace(/[^\w.-]+/g, "_")}`;
      const { error } = await supabase.storage.from("clips").upload(path, f, { upsert: false });
      if (error) {
        setUploading(null);
        setMsg(`Upload failed: ${error.message}`);
        router.refresh();
        return;
      }
    }
    setUploading(null);
    setMsg(null);
    router.refresh();
  }

  function make() {
    setMsg(null);
    start(async () => {
      const r = await makePack({ weekOf, notes });
      setMsg(r.message ?? null);
      router.refresh();
    });
  }

  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-display font-semibold">Posts for the week of {shortDate(weekOf)}</h1>
        <p className="mt-3">
          Send this week&apos;s product photos and try-on clips, list what&apos;s new, and 2fish writes 7 posts. Approve them,
          then copy each one to Instagram or TikTok from your phone.
        </p>
      </header>

      {!locked ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">
                Photos and clips <span className="num font-normal text-muted-foreground">({uploads.length})</span>
              </h2>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onFiles} />
              <Button size="sm" variant="outline" disabled={Boolean(uploading) || uploads.length >= MAX_FILES} onClick={() => fileRef.current?.click()}>
                <Upload aria-hidden="true" />
                Choose photos or clips
              </Button>
            </div>
            {uploading ? (
              <p className="mt-3 text-sm" aria-live="polite">
                {uploading}
              </p>
            ) : null}
            {uploads.length ? (
              <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {uploads.map((u) => (
                  <li key={u.path} className="relative">
                    <Thumb url={u.url} isImage={u.isImage} name={u.name} />
                    <RemoveUpload path={u.path} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">About 10 photos or a few short clips make a good week. Straight from your camera roll is fine.</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-5">
            <label htmlFor="pack-notes" className="font-semibold">
              What&apos;s new in the store?
            </label>
            <p className="mt-1 text-sm text-muted-foreground">One item per line. These are the items the posts feature and the report counts.</p>
            <Textarea
              id="pack-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="mt-3 text-sm"
              placeholder={"Green wrap dress\nFall knit sweaters\nGold hoop earrings\nCandles, the fig one"}
            />
            <Button variant={posts.length ? "outline" : "signal"} className="mt-4 w-full" disabled={pending || Boolean(uploading)} onClick={make}>
              {pending ? "Writing your posts…" : posts.length ? "Write them again" : "Make my 7 posts"}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
              {pending ? "Takes about 30 seconds." : msg ?? (posts.length ? "Starting over replaces the drafts below." : "")}
            </p>
          </div>
        </section>
      ) : msg ? (
        <p className="mt-4 text-sm" aria-live="polite">
          {msg}
        </p>
      ) : null}

      {posts.length ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4">
            <p className="text-sm">
              <span className="num font-semibold">{approved} of {posts.length} approved.</span>{" "}
              {approved === posts.length ? "Post one a day. Tap Copy, then paste into Instagram." : "Read each one, fix anything, then approve."}
            </p>
            {approved < posts.length ? (
              <Button
                size="sm"
                variant="signal"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await approveWeek({ weekOf });
                    router.refresh();
                  })
                }
              >
                <Check aria-hidden="true" />
                Approve all
              </Button>
            ) : null}
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Thumb({ url, isImage, name, className }: { url: string | null; isImage: boolean; name: string; className?: string }) {
  if (url && isImage && !/\.hei[cf]$/i.test(name)) {
    // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs, no need for the image optimizer
    return <img src={url} alt={name} loading="lazy" className={cn("aspect-square w-full rounded-md bg-surface object-cover", className)} />;
  }
  return (
    <div className={cn("flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md bg-surface p-2 text-center text-sm", className)}>
      <Film size={18} aria-hidden="true" />
      <span className="line-clamp-2 break-all">{name}</span>
    </div>
  );
}

function RemoveUpload({ path }: { path: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await removeUpload({ path });
          router.refresh();
        })
      }
      className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full bg-white text-ink focus-visible:outline-2 focus-visible:outline-signal"
    >
      <X size={14} aria-hidden="true" />
      <span className="sr-only">Remove</span>
    </button>
  );
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [items, setItems] = useState(post.items.join(", "));
  const [note, setNote] = useState<string | null>(null);

  const full = [post.hook, post.caption].filter(Boolean).join("\n\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setNote("Copied. Paste it into Instagram.");
    } catch {
      setNote("Couldn't copy. Press and hold the caption to copy it.");
    }
  }

  function save() {
    start(async () => {
      const r = await updatePost({ id: post.id, caption, items: items.split(",").map((s) => s.trim()).filter(Boolean) });
      if (r.ok) setEditing(false);
      setNote(r.ok ? "Saved." : r.message);
      router.refresh();
    });
  }

  function status(s: Post["status"]) {
    start(async () => {
      await setPostStatus({ id: post.id, status: s });
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg bg-white">
      {post.mediaPath ? <Thumb url={post.mediaUrl} isImage={post.isImage} name={post.mediaPath.split("/").pop()?.replace(/^\d+-/, "") ?? ""} className="aspect-[4/5] rounded-none" /> : null}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {post.day} · {post.kind}
          </span>
          {post.status !== "draft" ? (
            <span className="confirm flex items-center gap-1 font-semibold text-night">
              <Check size={14} aria-hidden="true" />
              {post.status === "posted" ? "Posted" : "Approved"}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 font-semibold">{post.title}</h3>
        {post.hook ? <p className="mt-1 text-sm font-medium">{post.hook}</p> : null}
        {editing ? (
          <div className="mt-2 space-y-2">
            <label className="sr-only" htmlFor={`cap-${post.id}`}>
              Caption
            </label>
            <Textarea id={`cap-${post.id}`} value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} className="text-sm" />
            <label className="text-sm font-semibold" htmlFor={`items-${post.id}`}>
              Items it shows, separated by commas
            </label>
            <Textarea id={`items-${post.id}`} value={items} onChange={(e) => setItems(e.target.value)} rows={2} className="text-sm" />
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm whitespace-pre-wrap select-all">{post.caption}</p>
            {post.items.length ? <p className="mt-2 text-sm text-muted-foreground">Shows: {post.items.join(", ")}</p> : null}
          </>
        )}
        {note ? (
          <p className="mt-2 text-sm" aria-live="polite">
            {note}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {editing ? (
            <>
              <Button disabled={pending} onClick={save}>
                Save
              </Button>
              <Button variant="ghost" disabled={pending} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : post.status === "draft" ? (
            <>
              <Button disabled={pending} onClick={() => status("approved")}>
                <Check aria-hidden="true" />
                Approve
              </Button>
              <Button variant="ghost" disabled={pending} onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={copy}>
                <Copy aria-hidden="true" />
                Copy caption
              </Button>
              {post.mediaUrl ? (
                <Button variant="outline" asChild>
                  <a href={post.mediaUrl} target="_blank" rel="noreferrer">
                    <Download aria-hidden="true" />
                    Save {post.isImage ? "photo" : "clip"}
                  </a>
                </Button>
              ) : null}
              {post.status === "approved" ? (
                <Button variant="ghost" disabled={pending} onClick={() => status("posted")}>
                  Mark posted
                </Button>
              ) : (
                <Button variant="ghost" disabled={pending} onClick={() => status("approved")}>
                  Undo posted
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}
