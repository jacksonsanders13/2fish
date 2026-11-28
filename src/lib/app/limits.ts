import type { SupabaseClient } from "@supabase/supabase-js";

// Caps so a fake account or one heavy user can't run up the Claude or Twilio bill.
// The real numbers live in the use_quota() database function; these are only for
// the messages owners see. Chat also has a monthly cap by plan (Solo 30,
// Growing 100, Established 200), checked before the daily one.
export const DAILY_LIMITS = { chat: 50, text: 30, pack: 5, skill: 20 } as const;

/** Counts one use and says whether the owner is still under today's cap. Fails closed. */
export async function takeQuota(supabase: SupabaseClient, kind: keyof typeof DAILY_LIMITS): Promise<boolean> {
  const { data, error } = await supabase.rpc("use_quota", { p_kind: kind });
  return !error && data === true;
}

export const limitMessage = {
  chat: `You've reached this month's chat limit (30 messages on Solo, 100 on Growing, 200 on Established; never more than ${DAILY_LIMITS.chat} in a day). It resets on the 1st. Your posts and calendar keep working.`,
  text: `That's ${DAILY_LIMITS.text} texts today, the daily limit. Sending opens again tomorrow.`,
  pack: `That's ${DAILY_LIMITS.pack} weekly packs made today, the daily limit. Try again tomorrow.`,
  skill: `That's ${DAILY_LIMITS.skill} specialist jobs today, the daily limit. Fisher's specialists are back tomorrow.`,
};
