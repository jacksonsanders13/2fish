// Outbound texting. Twilio when the keys exist, otherwise the message is kept
// as "queued" so the owner can see exactly what would have gone out. Real
// traffic also needs A2P 10DLC registration on the Twilio side first.

export type SendResult = { status: "sent" | "queued" | "failed"; providerId?: string; error?: string };

export function smsConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  if (!smsConfigured()) return { status: "queued" };

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    const json = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) return { status: "failed", error: json.message ?? `Twilio returned ${res.status}` };
    return { status: "sent", providerId: json.sid };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : "Could not reach Twilio" };
  }
}

/** True between the owner's texting hours in their time zone. */
export function withinHours(hoursStart: number, hoursEnd: number, timezone: string, now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: timezone }).format(now));
  return hour >= hoursStart && hour < hoursEnd;
}
