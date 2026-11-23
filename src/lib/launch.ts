// Waitlist mode: the public site collects sign-ups and the product stays closed.
// On unless NEXT_PUBLIC_WAITLIST_MODE is set to "off" in Vercel.
export const WAITLIST = process.env.NEXT_PUBLIC_WAITLIST_MODE !== "off";