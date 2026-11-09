"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Category } from "@/lib/categories";
import { zipOk } from "@/lib/format";
import { exampleNeeds, ME } from "@/lib/mock";
import * as api from "@/lib/needs-api";
import { supabaseConfigured } from "@/lib/supabase";
import type { HelpMethod, Need, Range } from "@/lib/types";

// Two modes:
// - live: Supabase keys are set, needs come from the database and update in
//   real time. People are signed in anonymously in the background.
// - preview: no keys, everything lives in memory and a refresh resets it.

export const LIVE = supabaseConfigured;

type Board = {
  live: boolean;
  ready: boolean;
  loadError: string;
  reload: () => void;
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
  // each action resolves true if it worked; on failure it shows a toast itself
  addNeed: (n: api.NewNeed) => Promise<boolean>;
  pledge: (id: string, method: HelpMethod, note: string) => Promise<boolean>;
  cancelPledge: (id: string) => Promise<boolean>;
  markReceived: (id: string) => Promise<boolean>;
  removeNeed: (id: string) => Promise<boolean>;
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
  const inBrowser = useInBrowser();
  const [needs, setNeeds] = useState<Need[]>(LIVE ? [] : exampleNeeds);
  const [loaded, setLoaded] = useState(!LIVE);
  const [loadError, setLoadError] = useState("");
  const [me, setMe] = useState(LIVE ? "" : ME);
  const [zip, setZipState] = useState(() => (typeof window === "undefined" ? "" : read("2fish-zip")));
  const [range, setRange] = useState<Range>(() => (typeof window !== "undefined" && zipOk(read("2fish-zip")) ? "area" : "all"));
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [displayName, setNameState] = useState(() => (typeof window === "undefined" ? "" : read("2fish-name")));
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [helpTarget, setHelpTarget] = useState<Need | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3200);
  }, []);

  // live mode: sign in, load the board, then keep it fresh
  useEffect(() => {
    if (!LIVE) return;
    let stop = () => {};
    let cancelled = false;
    const refresh = () =>
      api
        .fetchNeeds()
        .then((rows) => !cancelled && setNeeds(rows))
        .catch(() => {});
    (async () => {
      try {
        const id = await api.ensureUser();
        const rows = await api.fetchNeeds();
        if (cancelled) return;
        setMe(id);
        setNeeds(rows);
        setLoadError("");
        stop = api.watchNeeds(refresh);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Couldn't load the board.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setLoaded(false);
    setLoadError("");
    setAttempt((a) => a + 1);
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
  const replace = useCallback((row: Need) => patch(row.id, () => row), [patch]);

  // Runs a database call; shows the error as a toast if it fails.
  const attemptCall = useCallback(
    async (work: () => Promise<void>) => {
      try {
        await work();
        return true;
      } catch (e) {
        toast(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        return false;
      }
    },
    [toast],
  );

  const value = useMemo<Board>(
    () => ({
      live: LIVE,
      ready: inBrowser && loaded,
      loadError,
      reload,
      me, needs, zip, setZip, range, setRange, cat, setCat, q, setQ,
      displayName, setDisplayName, draftCategory, setDraftCategory,
      helpTarget,
      openHelp: (n) => setHelpTarget(n),
      closeHelp: () => setHelpTarget(null),
      toastMsg, toast,

      addNeed: (n) =>
        LIVE
          ? attemptCall(async () => {
              const row = await api.createNeed(n);
              setNeeds((all) => [row, ...all.filter((x) => x.id !== row.id)]);
            })
          : Promise.resolve(
              (setNeeds((all) => [{ ...n, id: "local-" + Date.now(), posterId: ME, status: "open", createdAt: Date.now() }, ...all]), true),
            ),

      // one helper per need, so only an open need can be pledged
      pledge: (id, method, note) =>
        LIVE
          ? attemptCall(async () => replace(await api.pledgeNeed(id, method, note)))
          : Promise.resolve(
              (patch(id, (n) => (n.status === "open" ? { ...n, status: "pledged", helper: { id: ME, method, note } } : n)), true),
            ),

      cancelPledge: (id) =>
        LIVE
          ? attemptCall(async () => replace(await api.cancelPledge(id)))
          : Promise.resolve((patch(id, (n) => ({ ...n, status: "open", helper: undefined })), true)),

      markReceived: (id) =>
        LIVE
          ? attemptCall(async () => replace(await api.markReceived(id)))
          : Promise.resolve((patch(id, (n) => ({ ...n, status: "done" })), true)),

      removeNeed: (id) =>
        LIVE
          ? attemptCall(async () => {
              await api.deleteNeed(id);
              setNeeds((all) => all.filter((n) => n.id !== id));
            })
          : Promise.resolve((setNeeds((all) => all.filter((n) => n.id !== id)), true)),

      // preview-mode testing shortcut so you can try "I got it" on your own post
      fakeNeighborHelps: (id) =>
        patch(id, (n) => ({
          ...n,
          status: "pledged",
          helper: { id: "fake-neighbor", method: n.inPerson ? "inperson" : "wishlist", note: "I can bring it by Saturday morning" },
        })),
    }),
    [inBrowser, loaded, loadError, reload, me, needs, zip, setZip, range, cat, q, displayName, setDisplayName, draftCategory, helpTarget, toastMsg, toast, patch, replace, attemptCall],
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
