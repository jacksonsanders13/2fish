"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

// Light/dark switch. The choice is saved per browser; with no choice saved
// the app follows the phone/computer setting. The <head> script in
// layout.tsx applies the saved choice before first paint (no flash).

type Theme = "light" | "dark";
const KEY = "2fish-theme";
const EVENT = "2fish-theme-change";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghostOnPrimary"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {}
        window.dispatchEvent(new Event(EVENT));
      }}
    >
      {/* nothing until we know the theme, so the icon never flips after load */}
      {theme === "dark" ? <Sun aria-hidden="true" /> : theme === "light" ? <Moon aria-hidden="true" /> : null}
    </Button>
  );
}

// Inlined into <head>. Keep it tiny and dependency-free.
export const themeScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
