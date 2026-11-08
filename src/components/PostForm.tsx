"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBoard } from "./BoardProvider";
import { CATEGORIES, type Category } from "@/lib/categories";
import { digitsOnly, looksLikeAddress, safeUrl, zipOk } from "@/lib/format";

export default function PostForm() {
  const b = useBoard();
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(b.draftCategory ?? "Baby");
  const [neededBy, setNeededBy] = useState("");
  const [story, setStory] = useState("");
  const [zip, setZip] = useState(b.zip);
  const [area, setArea] = useState("");
  const [inPerson, setInPerson] = useState(true);
  const [meetSpot, setMeetSpot] = useState("");
  const [useWishlist, setUseWishlist] = useState(false);
  const [wishlistUrl, setWishlistUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // returns an error message, or "" if it's good to go
  function check() {
    if (!title.trim()) return 'Add what you need, like "Size 4 diapers".';
    if (!zipOk(zip)) return "Enter a 5-digit ZIP so nearby neighbors can find your post.";
    if (!inPerson && !useWishlist) return "Choose at least one way to receive help.";
    if (inPerson && !meetSpot.trim()) return "Add a public meeting spot, like a library or church lobby.";
    if (useWishlist && !safeUrl(wishlistUrl.trim())) return "Paste the full wishlist link, starting with https://";
    if (looksLikeAddress((inPerson ? meetSpot : "") + " " + story)) return "That looks like a street address. Use a public spot instead to stay safe.";
    return "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = check();
    setError(problem);
    if (problem) return;

    b.addNeed({
      title: title.trim(),
      category,
      story: story.trim(),
      zip,
      area: area.trim(),
      displayName: b.displayName.trim(),
      neededBy,
      inPerson,
      meetSpot: inPerson ? meetSpot.trim() : "",
      wishlistUrl: useWishlist ? (safeUrl(wishlistUrl.trim()) ?? "") : "",
    });
    b.setDraftCategory(null);
    b.toast("Posted. Neighbors near " + zip + " can see it now.");
    router.push("/activity");
  }

  return (
    <form onSubmit={submit} noValidate className="box grid gap-3.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-xl font-black">Post a need</h2>
        <Link href="/" className="btn btn-soft">
          Cancel
        </Link>
      </div>

      <Field label="What do you need?" id="f-title">
        <input ref={titleRef} id="f-title" className="input" maxLength={80} placeholder="Size 4 diapers" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <div className="grid gap-3 min-[481px]:grid-cols-2">
        <Field label="Category" id="f-cat">
          <select id="f-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Needed by" id="f-by">
          <input id="f-by" type="date" className="input" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
        </Field>
      </div>

      <Field label="Tell your story" id="f-story">
        <textarea
          id="f-story"
          className="input"
          rows={3}
          maxLength={400}
          placeholder="A little about your situation, plus sizes or quantity so neighbors pick the right thing."
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </Field>

      <div className="grid gap-3 min-[481px]:grid-cols-2">
        <Field label="ZIP code" id="f-zip">
          <input id="f-zip" className="input" inputMode="numeric" maxLength={5} placeholder="27615" value={zip} onChange={(e) => setZip(digitsOnly(e.target.value))} />
        </Field>
        <Field label="Neighborhood (optional)" id="f-area">
          <input id="f-area" className="input" maxLength={40} placeholder="North Raleigh" value={area} onChange={(e) => setArea(e.target.value)} />
        </Field>
      </div>

      <Field label="First name or nickname" id="f-name" hint='Leave it blank to post as "A neighbor".'>
        <input id="f-name" className="input" maxLength={24} placeholder="Jess" value={b.displayName} onChange={(e) => b.setDisplayName(e.target.value)} />
      </Field>

      <div className="grid gap-1.5">
        <span className="label">How can neighbors get it to you?</span>
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={inPerson} onChange={(e) => setInPerson(e.target.checked)} /> Drop off in person at a public spot
        </label>
        {inPerson && (
          <input
            className="input"
            aria-label="Meeting spot"
            maxLength={60}
            placeholder="Meeting spot, e.g. North Regional Library lobby"
            value={meetSpot}
            onChange={(e) => setMeetSpot(e.target.value)}
          />
        )}
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={useWishlist} onChange={(e) => setUseWishlist(e.target.checked)} /> Buy it from my wishlist
        </label>
        {useWishlist && (
          <input
            className="input"
            aria-label="Wishlist link"
            type="url"
            maxLength={300}
            placeholder="https://www.amazon.com/hz/wishlist/ls/..."
            value={wishlistUrl}
            onChange={(e) => setWishlistUrl(e.target.value)}
          />
        )}
      </div>

      <div className="rounded-[10px] bg-brand-soft px-3 py-2.5 text-sm">
        Never put your home address in a post. Pick a public meeting spot, or use a wishlist so the store ships to you privately.
      </div>

      <div role="alert" className="min-h-[1em] text-sm font-bold text-[#c62828]">
        {error}
      </div>

      <button type="submit" className="btn btn-go">
        Post my need
      </button>
    </form>
  );
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </div>
  );
}
