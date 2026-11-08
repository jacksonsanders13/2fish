"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "./BoardProvider";
import { safeUrl } from "@/lib/format";
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
      className="m-auto w-[calc(100%-32px)] max-w-[420px] rounded-2xl border-0 bg-surface p-[18px] text-ink"
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    pledge(n.id, method, note.trim());
    closeHelp();
    toast(method === "wishlist" ? "Thank you! Open the wishlist to place the order." : "Thank you! Meet at the spot listed on the post.");
  }

  return (
    <form onSubmit={submit}>
      <h2 id="help-title" className="m-0 mb-1 text-[21px] font-black">
        Help a neighbor
      </h2>
      <p className="m-0 text-muted">
        {n.title} for {n.displayName || "a neighbor"} in {n.zip}
      </p>

      <div className="my-3 grid gap-2">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-2.5 has-[:checked]:border-go">
            <input type="radio" name="method" value={o.value} checked={method === o.value} onChange={() => setMethod(o.value)} className="mt-1" />
            <div>
              <div className="font-bold">{o.title}</div>
              <div className="text-[13px] text-muted">{o.detail}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="h-note" className="label">
          Note to them (optional)
        </label>
        <input id="h-note" className="input" maxLength={140} placeholder="I can drop off Saturday morning" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-4">
        <button type="button" className="btn btn-soft" onClick={closeHelp}>
          Cancel
        </button>
        <button type="submit" className="btn btn-go">
          Count me in
        </button>
      </div>
    </form>
  );
}
