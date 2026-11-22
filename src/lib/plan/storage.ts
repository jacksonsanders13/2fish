import type { Answers } from "./estimate";

// Grader answers live in the browser until the owner signs in. sessionStorage
// survives the hop from /audit to /results and disappears when the tab closes.
// The key changed with the grader, so old audit answers are simply ignored.
const KEY = "2fish.grader";

export function saveAnswers(answers: Partial<Answers>) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // Private mode or storage blocked. The grader still works in memory.
  }
}

export function readAnswers(): Answers | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Partial<Answers>;
    if (!a.store) return null;
    return {
      store: a.store ?? "",
      instagram: a.instagram ?? "",
      posts: a.posts ?? "",
      sale: a.sale ?? "",
      reviews: a.reviews ?? "",
      track: a.track ?? "",
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
