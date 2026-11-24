import type { SupabaseClient } from "@supabase/supabase-js";

// Daily caps so a fake account can't run up the Claude or Twilio bill.
// The real numbers live in the use_quota() database function (50 chats, 30 texts);
// these are only for the messages owners see.
export const DAILY_LIMITS = { chat: 50, text: 30, pack: 5, skill: 20 } as const;

/** Counts one use and says whether the owner is still under today's cap. Fails closed. */
export async function takeQuota(supabase: SupabaseClient, kind: keyof typeof DAILY_LIMITS): Promise<boolean> {
  const { data, error } = await supabase.rpc("use_quota", { p_kind: kind });
  return !error && data === true;
}

export const limitMessage = {
  chat: `That's ${DAILY_LIMITS.chat} messages today, the daily limit. Fisher is back tomorrow.`,
  text: `That's ${DAILY_LIMITS.text} texts today, the daily limit. Sending opens again tomorrow.`,
  pack: `That's ${DAILY_LIMITS.pack} weekly packs made today, the daily limit. Try again tomorrow.`,
  skill: `That's ${DAILY_LIMITS.skill} specialist jobs today, the daily limit. Fisher's specialists are back tomorrow.`,
};
