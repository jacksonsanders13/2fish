"use client";

import Avatar from "./Avatar";
import Logo from "./Logo";
import { useBoard } from "./BoardProvider";
import { CAT_COLOR } from "@/lib/categories";
import { daysUntil, dueLabel, safeUrl, timeAgo } from "@/lib/format";
import type { Need } from "@/lib/types";

const STATUS_LABEL = { open: "Open", pledged: "Being helped", done: "Received" };
const STATUS_STYLE = {
  open: "bg-brand-soft text-brand",
  pledged: "bg-warn-soft text-ink",
  done: "bg-go-soft text-go",
};
const PROGRESS = { open: "12%", pledged: "60%", done: "100%" };
const STEP = { open: 0, pledged: 1, done: 2 };

export default function NeedCard({ need: n }: { need: Need }) {
  const board = useBoard();
  const mine = n.posterId === board.me;
  const helping = n.helper?.id === board.me;
  const color = CAT_COLOR[n.category] ?? CAT_COLOR.Other;
  const wishlist = safeUrl(n.wishlistUrl);
  const due = daysUntil(n.neededBy);
  const where = [n.area, n.zip].filter(Boolean).join(" · ");

  return (
    <article className="box overflow-hidden">
      {/* who posted it */}
      <div className="flex items-center gap-2.5 px-3 pb-2 pt-3">
        <Avatar name={n.displayName || "Neighbor"} seed={n.posterId} />
        <div className="min-w-0 flex-1">
          <b className="block font-extrabold">
            {n.displayName || "A neighbor"}
            {n.example && (
              <span className="ml-1.5 rounded-md border border-dashed border-muted px-1.5 py-px align-[2px] text-[11px] font-extrabold text-muted">
                Example
              </span>
            )}
          </b>
          <small className="text-[13px] text-muted">
            {where} · {timeAgo(n.createdAt)}
          </small>
        </div>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-extrabold ${STATUS_STYLE[n.status]}`}>
          {STATUS_LABEL[n.status]}
        </span>
      </div>

      <div className="grid gap-1.5 px-3 pb-2.5">
        <h3 className="m-0 text-[19px] font-black leading-tight text-balance">{n.title}</h3>
        {n.story && <p className="m-0 max-w-[65ch]">{n.story}</p>}
      </div>

      {/* colored category band */}
      <div className="flex items-center justify-between gap-2.5 p-3.5 font-extrabold text-white" style={{ background: color }}>
        <div className="flex items-center gap-2.5">
          <span className="opacity-90">
            <Logo size={34} fill={color} stroke="#fff" />
          </span>
          <span className="text-[13px] uppercase tracking-[.08em] opacity-95">{n.category}</span>
        </div>
        {n.neededBy && n.status !== "done" && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm ${due !== null && due <= 2 ? "bg-white text-[#7a4700]" : "bg-black/20"}`}
          >
            {dueLabel(n.neededBy)}
          </span>
        )}
      </div>

      {/* Posted -> Helper found -> Received */}
      <div className="px-3 pb-1 pt-3">
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <i className="block h-full rounded-full bg-go transition-[width] duration-500" style={{ width: PROGRESS[n.status] }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-bold text-muted">
          {["Posted", "Helper found", "Received"].map((label, i) => (
            <span key={label} className={i <= STEP[n.status] ? "text-ink" : undefined}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {(n.inPerson || wishlist) && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-0.5 pt-1.5 text-[13px]">
          {n.inPerson && <span className="rounded-lg bg-page px-2 py-1 font-semibold text-muted">Drop off: {n.meetSpot || "public spot"}</span>}
          {wishlist && <span className="rounded-lg bg-page px-2 py-1 font-semibold text-muted">Wishlist</span>}
        </div>
      )}

      {n.helper && n.status !== "open" && n.helper.note && (
        <div className="mx-3 mt-1.5 rounded-[10px] bg-go-soft px-2.5 py-2 text-sm">Helper: {n.helper.note}</div>
      )}

      <Actions need={n} mine={mine} helping={helping} wishlist={wishlist} />
    </article>
  );
}

function Actions({ need: n, mine, helping, wishlist }: { need: Need; mine: boolean; helping: boolean; wishlist: string | null }) {
  const { openHelp, cancelPledge, markReceived, removeNeed, fakeNeighborHelps, toast } = useBoard();
  const buttons: React.ReactNode[] = [];

  if (!mine && n.status === "open") {
    buttons.push(
      <button key="help" type="button" className="btn btn-go" onClick={() => openHelp(n)}>
        I&apos;ll help
      </button>,
    );
  }
  if (wishlist && n.status !== "done") {
    buttons.push(
      <a key="wish" className="btn" href={wishlist} target="_blank" rel="noopener noreferrer">
        View wishlist
      </a>,
    );
  }
  if (helping && n.status === "pledged") {
    buttons.push(
      <button
        key="cancel"
        type="button"
        className="btn btn-soft"
        onClick={() => {
          cancelPledge(n.id);
          toast("Offer cancelled. The post is open again.");
        }}
      >
        Cancel my offer
      </button>,
    );
  }
  if (mine && n.status === "pledged") {
    buttons.push(
      <button
        key="got"
        type="button"
        className="btn btn-go"
        onClick={() => {
          markReceived(n.id);
          toast("Marked received. So glad it came through.");
        }}
      >
        I got it, thank you
      </button>,
    );
  }
  if (mine && n.status === "open") {
    buttons.push(
      <button
        key="remove"
        type="button"
        className="btn btn-soft"
        onClick={() => {
          removeNeed(n.id);
          toast("Post removed.");
        }}
      >
        Remove post
      </button>,
      // TODO: delete this once real helpers exist (Milestone 4)
      <button
        key="fake"
        type="button"
        className="btn btn-soft border-dashed border-muted text-sm text-muted"
        onClick={() => {
          fakeNeighborHelps(n.id);
          toast("Test mode: a pretend neighbor offered to help.");
        }}
      >
        Test: pretend a neighbor helps
      </button>,
    );
  }

  if (!buttons.length) return null;
  return <div className="flex flex-wrap gap-2 px-3 pb-3 pt-2.5">{buttons}</div>;
}
