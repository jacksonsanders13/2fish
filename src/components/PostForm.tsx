"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBoard } from "./BoardProvider";
import { Button, buttonVariants } from "./ui/button";
import { Field, Input, Select, Textarea, choiceVariants } from "./ui/input";
import { Notice } from "./ui/notice";
import { Heading, Text } from "./ui/typography";
import { CATEGORIES, type Category } from "@/lib/categories";
import { digitsOnly, looksLikeAddress, safeUrl, zipOk } from "@/lib/format";

type Problem = { msg: string; field: string } | null;

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
  const [problem, setProblem] = useState<Problem>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // returns what's wrong and which field to point at, or null if it's good to go
  function check(): Problem {
    if (!title.trim()) return { msg: 'Add what you need, like "Size 4 diapers".', field: "f-title" };
    if (!zipOk(zip)) return { msg: "Enter a 5-digit ZIP so nearby neighbors can find your post.", field: "f-zip" };
    if (!inPerson && !useWishlist) return { msg: "Choose at least one way to receive help.", field: "f-inperson" };
    if (inPerson && !meetSpot.trim()) return { msg: "Add a public meeting spot, like a library or church lobby.", field: "f-spot" };
    if (useWishlist && !safeUrl(wishlistUrl.trim())) return { msg: "Paste the full wishlist link, starting with https://", field: "f-wish" };
    if (looksLikeAddress(inPerson ? meetSpot : ""))
      return { msg: "That looks like a street address. Use a public spot instead to stay safe.", field: "f-spot" };
    if (looksLikeAddress(story)) return { msg: "That looks like a street address. Use a public spot instead to stay safe.", field: "f-story" };
    return null;
  }

  const bad = (id: string) => (problem?.field === id ? true : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = check();
    setProblem(p);
    if (p) {
      document.getElementById(p.field)?.focus();
      return;
    }

    setBusy(true);
    const ok = await b.addNeed({
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
    setBusy(false);
    if (!ok) return;
    b.setDraftCategory(null);
    b.toast("Posted. Neighbors near " + zip + " can see it now.");
    router.push("/activity");
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 px-4 py-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <Heading as="h1" level="page">
            Post a need
          </Heading>
          <Text tone="muted">It only takes a minute. Neighbors near your ZIP will see it.</Text>
        </div>
        <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          Cancel
        </Link>
      </div>

      <Field label="What do you need?" id="f-title">
        <Input ref={titleRef} id="f-title" aria-invalid={bad("f-title")} maxLength={80} placeholder="Size 4 diapers" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" id="f-cat">
          <Select id="f-cat" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Needed by" id="f-by">
          <Input id="f-by" type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
        </Field>
      </div>

      <Field label="Tell your story" id="f-story">
        <Textarea
          id="f-story"
          aria-invalid={bad("f-story")}
          rows={3}
          maxLength={400}
          placeholder="A little about your situation, plus sizes or quantity so neighbors pick the right thing."
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ZIP code" id="f-zip">
          <Input id="f-zip" aria-invalid={bad("f-zip")} inputMode="numeric" maxLength={5} placeholder="27615" value={zip} onChange={(e) => setZip(digitsOnly(e.target.value))} />
        </Field>
        <Field label="Neighborhood (optional)" id="f-area">
          <Input id="f-area" maxLength={40} placeholder="North Raleigh" value={area} onChange={(e) => setArea(e.target.value)} />
        </Field>
      </div>

      <Field label="First name or nickname" id="f-name" hint='Leave it blank to post as "A neighbor".'>
        <Input id="f-name" maxLength={24} placeholder="Jess" value={b.displayName} onChange={(e) => b.setDisplayName(e.target.value)} />
      </Field>

      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-extrabold">How can neighbors get it to you?</legend>
        <label className={choiceVariants({ variant: "plain" })}>
          <input id="f-inperson" type="checkbox" className="mt-1 size-4 accent-primary" checked={inPerson} onChange={(e) => setInPerson(e.target.checked)} />
          Drop off in person at a public spot
        </label>
        {inPerson && (
          <Input
            id="f-spot"
            aria-label="Meeting spot"
            aria-invalid={bad("f-spot")}
            maxLength={60}
            placeholder="Meeting spot, e.g. North Regional Library lobby"
            value={meetSpot}
            onChange={(e) => setMeetSpot(e.target.value)}
          />
        )}
        <label className={choiceVariants({ variant: "plain" })}>
          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={useWishlist} onChange={(e) => setUseWishlist(e.target.checked)} />
          Buy it from my wishlist
        </label>
        {useWishlist && (
          <Input
            id="f-wish"
            aria-label="Wishlist link"
            aria-invalid={bad("f-wish")}
            type="url"
            maxLength={300}
            placeholder="https://www.amazon.com/hz/wishlist/ls/..."
            value={wishlistUrl}
            onChange={(e) => setWishlistUrl(e.target.value)}
          />
        )}
      </fieldset>

      <Notice variant="info">
        <b>Stay safe:</b> never put your home address in a post. Pick a public meeting spot, or use a wishlist so the store ships to you privately.
      </Notice>

      <div role="alert">{problem && <Notice key={problem.msg} variant="danger">{problem.msg}</Notice>}</div>

      <Button type="submit" variant="primary" size="lg" block disabled={busy}>
        {busy ? "Posting…" : "Post my need"}
      </Button>
    </form>
  );
}
