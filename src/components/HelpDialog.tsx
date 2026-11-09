"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "./BoardProvider";
import { Button } from "./ui/button";
import { Field, Input, choiceVariants } from "./ui/input";
import { safeUrl } from "@/lib/format";
import { Heading, Text } from "./ui/typography";
import type { HelpMethod, Need } from "@/lib/types";

export default function HelpDialog() {
  const { helpTarget, closeHelp } = useBoard();
  const ref = useRef<HTMLDialogElement>(null);

  // open/close the browser's built-in popup to match whatever need was tapped
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (helpTarget && !d.open) d.showModal();
    if (!helpTarget && d.open) d.close();
  }, [helpTarget]);

  return (
    <dialog
      ref={ref}
      onClose={closeHelp}
      aria-labelledby="help-title"
      className="mx-0 mb-0 mt-auto w-full max-w-none rounded-t-xl border-0 bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground shadow-pop open:animate-sheet-in sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-xl sm:pb-6 sm:open:animate-scale-in"
    >
      {helpTarget && <HelpForm key={helpTarget.id} need={helpTarget} />}
    </dialog>
  );
}

function HelpForm({ need: n }: { need: Need }) {
  const { pledge, closeHelp, toast } = useBoard();

  const options: { value: HelpMethod; title: string; detail: string }[] = [];
  if (n.inPerson) options.push({ value: "inperson", title: "I'll drop it off", detail: "At " + (n.meetSpot || "their public spot") });
  if (safeUrl(n.wishlistUrl)) options.push({ value: "wishlist", title: "I'll buy from their wishlist", detail: "The store ships it to them directly" });

  const [method, setMethod] = useState<HelpMethod>(options[0]?.value ?? "inperson");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await pledge(n.id, method, note.trim());
    setBusy(false);
    closeHelp();
    if (!ok) return;
    toast(method === "wishlist" ? "Thank you! Open the wishlist to place the order." : "Thank you! Meet at the spot listed on the post.");
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* grab handle, phones only */}
      <span aria-hidden="true" className="mx-auto -mt-2 h-1 w-10 rounded-full bg-border sm:hidden" />
      <div className="grid gap-1">
        <Heading id="help-title" level="section">
          Help a neighbor
        </Heading>
        <Text tone="muted">
          {n.title} for {n.displayName || "a neighbor"} in {n.zip}
        </Text>
      </div>

      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="sr-only">How you&apos;ll help</legend>
        {options.map((o) => (
          <label key={o.value} className={choiceVariants({ variant: "card" })}>
            <input
              type="radio"
              name="method"
              value={o.value}
              checked={method === o.value}
              onChange={() => setMethod(o.value)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="block font-bold">{o.title}</span>
              <span className="block text-sm text-muted-foreground">{o.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <Field label="Note to them (optional)" id="h-note">
        <Input id="h-note" maxLength={140} placeholder="I can drop off Saturday morning" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={closeHelp}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1" disabled={busy}>
          {busy ? "Saving…" : "Count me in"}
        </Button>
      </div>
    </form>
  );
}
