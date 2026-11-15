import type { Answers } from "./estimate";

// Audit answers live in the browser until the owner signs in. sessionStorage
// survives the hop from /audit to /results and disappears when the tab closes.
const KEY = "2fish.answers";

export function saveAnswers(answers: Partial<Answers>) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // Private mode or storage blocked. The audit still works in memory.
  }
}

export function readAnswers(): Answers | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Partial<Answers>;
    if (!a.type) return null;
    return {
      type: a.type ?? "",
      calls: a.calls ?? "",
      missed: a.missed ?? "",
      job: a.job ?? "",
      reviews: a.reviews ?? "",
      ask: a.ask ?? "",
      social: a.social ?? "",
      winback: a.winback ?? "",
      headache: a.headache ?? "",
    };
  } catch {
    return null;
  }
}

export function clearAnswers() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
