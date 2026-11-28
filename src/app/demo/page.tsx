"use client";

import { useEffect } from "react";
import { clearAnswers } from "@/lib/plan/storage";

// /demo starts a fresh test drive: wipe any earlier answers and the "seen the
// tour" flag, switch the demo on, then open the grader. Good for handing a
// phone or laptop to someone and watching them go through it.
export default function DemoStart() {
  useEffect(() => {
    clearAnswers();
    try {
      window.localStorage.removeItem("2fish_tour_seen");
    } catch {}
    document.cookie = "2fish_demo=1; path=/; samesite=lax";
    document.cookie = "2fish_demo_store=; path=/; max-age=0";
    window.location.replace("/audit");
  }, []);
  return <p className="p-8 text-muted-foreground">Starting the test drive…</p>;
}
