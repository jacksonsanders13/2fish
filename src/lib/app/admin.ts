// The 2fish team: emails in the ADMIN_EMAILS env var (comma separated, set in Vercel).
// They see the Examples page and can add examples every store learns from.
export function isAdmin(email: string | undefined | null) {
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}
