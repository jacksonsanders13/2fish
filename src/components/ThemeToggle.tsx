"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

// Light/dark switch. The choice is saved per browser; with no choice saved
// the app follows the device setting. The <head> script in layout.tsx
// applies the saved choice before first paint (no flash).

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

function toggle(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

// withLabel: shows "Dark mode" / "Light mode" next to the icon (desktop rail)
export default function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";
  // nothing until we know the theme, so the icon never flips after load
  const icon = theme === "dark" ? <Sun aria-hidden="true" /> : theme === "light" ? <Moon aria-hidden="true" /> : null;

  return withLabel ? (
    <Button variant="ghost" className="justify-start" onClick={() => toggle(next)}>
      {icon}
      {theme ? `${next === "dark" ? "Dark" : "Light"} mode` : "Theme"}
    </Button>
  ) : (
    <Button variant="ghost" size="icon" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={() => toggle(next)}>
      {icon}
    </Button>
  );
}

// Inlined into <head>. Keep it tiny and dependency-free.
export const themeScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
