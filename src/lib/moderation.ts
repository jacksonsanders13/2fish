// Light-touch content checks. Not a replacement for human review (reports go to a person),
// just enough to catch the obvious stuff before it hits the board.

// Starting list. Add to it as real posts come in.
const BLOCKED = [
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "pussy", "whore", "slut", "faggot", "fag", "nigger", "nigga",
  "retard", "kike", "spic", "chink", "wetback", "tranny",
];

// catches f*ck, f.u.c.k, fuuuck, etc.
const leet: Record<string, string> = { a: "[a@4]", e: "[e3]", i: "[i1!|]", o: "[o0]", s: "[s5$]", t: "[t7]", u: "[u*]" };
const BLOCKED_RE = new RegExp(
  "\\b(" +
    BLOCKED.map((w) =>
      w
        .split("")
        .map((ch) => (leet[ch] ?? ch) + "+[^a-z0-9]{0,1}")
        .join(""),
    ).join("|") +
    ")\\b",
  "i",
);

export function hasProfanity(text: string) {
  return BLOCKED_RE.test(text);
}

const URL_RE = /https?:\/\/|www\./gi;

export function looksLikeSpam(text: string) {
  const urls = (text.match(URL_RE) ?? []).length;
  if (urls >= 3) return "Too many links. Put one wishlist link in the wishlist field instead.";
  if (/(.)\1{9,}/.test(text)) return "That looks like keyboard mashing. Try again?";
  const letters = text.replace(/[^a-z]/gi, "");
  const caps = text.replace(/[^A-Z]/g, "");
  if (letters.length > 30 && caps.length / letters.length > 0.8) return "Please don't write in all caps.";
  if (/\b(bitcoin|crypto|forex|casino|escort|onlyfans|cashapp me|venmo me|send money|gift ?card code)\b/i.test(text)) {
    return "That doesn't look like a neighborhood need. 2fish is for physical items only.";
  }
  return null;
}

// one check for all user text: returns an error message or null
export function checkText(text: string, label = "text") {
  if (hasProfanity(text)) return `Let's keep the ${label} kind. Please remove the strong language.`;
  return looksLikeSpam(text);
}
