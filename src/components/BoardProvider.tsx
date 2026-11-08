"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Category } from "@/lib/categories";
import { zipOk } from "@/lib/format";
import { exampleNeeds, ME } from "@/lib/mock";
import type { HelpMethod, Need, Range } from "@/lib/types";

// Everything lives in memory for now, so a refresh resets the board.
// In Milestone 3 these actions get swapped for Supabase calls.

type Board = {
  ready: boolean;
  me: string;
  needs: Need[];
  zip: string;
  setZip: (z: string) => void;
  range: Range;
  setRange: (r: Range) => void;
  cat: Category | "All";
  setCat: (c: Category | "All") => void;
  q: string;
  setQ: (q: string) => void;
  displayName: string;
  setDisplayName: (n: string) => void;
  draftCategory: Category | null;
  setDraftCategory: (c: Category | null) => void;
  helpTarget: Need | null;
  openHelp: (n: Need) => void;
  closeHelp: () => void;
  toastMsg: string;
  toast: (msg: string) => void;
  addNeed: (n: Omit<Need, "id" | "posterId" | "status" | "createdAt">) => void;
  pledge: (id: string, method: HelpMethod, note: string) => void;
  cancelPledge: (id: string) => void;
  markReceived: (id: string) => void;
  removeNeed: (id: string) => void;
  fakeNeighborHelps: (id: string) => void;
};

const BoardContext = createContext<Board | null>(null);

export function useBoard() {
  const b = useContext(BoardContext);
  if (!b) throw new Error("useBoard needs to be inside <BoardProvider>");
  return b;
}

const read = (k: string) => {
  try {
    return localStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

// true once we're running in the browser. Times like "3h ago" and saved ZIPs
// only exist there, so the feed waits for this before drawing.
const noop = () => () => {};
const useInBrowser = () => useSyncExternalStore(noop, () => true, () => false);

export default function BoardProvider({ children }: { children: React.ReactNode }) {
  const ready = useInBrowser();
  const [needs, setNeeds] = useState<Need[]>(exampleNeeds);
  const [zip, setZipState] = useState(() => (typeof window === "undefined" ? "" : read("2fish-zip")));
  const [range, setRange] = useState<Range>(() => (typeof window !== "undefined" && zipOk(read("2fish-zip")) ? "area" : "all"));
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [displayName, setNameState] = useState(() => (typeof window === "undefined" ? "" : read("2fish-name")));
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [helpTarget, setHelpTarget] = useState<Need | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  const setZip = useCallback((z: string) => {
    setZipState(z);
    write("2fish-zip", z);
  }, []);

  const setDisplayName = useCallback((n: string) => {
    setNameState(n);
    write("2fish-name", n.trim());
  }, []);

  const patch = useCallback((id: string, fn: (n: Need) => Need) => {
    setNeeds((all) => all.map((n) => (n.id === id ? fn(n) : n)));
  }, []);

  const value = useMemo<Board>(
    () => ({
      ready, me: ME, needs, zip, setZip, range, setRange, cat, setCat, q, setQ,
      displayName, setDisplayName, draftCategory, setDraftCategory,
      helpTarget,
      openHelp: (n) => setHelpTarget(n),
      closeHelp: () => setHelpTarget(null),
      toastMsg, toast,
      addNeed: (n) =>
        setNeeds((all) => [{ ...n, id: "local-" + Date.now(), posterId: ME, status: "open", createdAt: Date.now() }, ...all]),
      // one helper per need, so only an open need can be pledged
      pledge: (id, method, note) =>
        patch(id, (n) => (n.status === "open" ? { ...n, status: "pledged", helper: { id: ME, method, note } } : n)),
      cancelPledge: (id) => patch(id, (n) => ({ ...n, status: "open", helper: undefined })),
      markReceived: (id) => patch(id, (n) => ({ ...n, status: "done" })),
      removeNeed: (id) => setNeeds((all) => all.filter((n) => n.id !== id)),
      // testing shortcut so you can try "I got it" on your own post
      fakeNeighborHelps: (id) =>
        patch(id, (n) => ({
          ...n,
          status: "pledged",
          helper: { id: "fake-neighbor", method: n.inPerson ? "inperson" : "wishlist", note: "I can bring it by Saturday morning" },
        })),
    }),
    [ready, needs, zip, setZip, range, cat, q, displayName, setDisplayName, draftCategory, helpTarget, toastMsg, toast, patch],
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
