"use client";

import { createContext, useContext } from "react";
import type { Post } from "@/lib/pilot/types";

// The test drive at /demo. No account, nothing saved: the dashboard runs on
// sample data and these stand in for the server actions, so buttons still work.
export type DemoApi = {
  setStatus: (id: string, status: Post["status"]) => void;
  approveAll: () => void;
  move: (id: string, postOn: string) => void;
  reply: (text: string) => string;
};

const Ctx = createContext<DemoApi | null>(null);
export const DemoProvider = Ctx.Provider;
export function useDemo() {
  return useContext(Ctx);
}

export const DEMO_COOKIE = "2fish_demo";

export function inDemo() {
  return typeof document !== "undefined" && document.cookie.split("; ").some((c) => c === `${DEMO_COOKIE}=1`);
}
