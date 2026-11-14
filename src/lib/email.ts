import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

// Email is optional. With no RESEND_API_KEY (or no service key to look up
// addresses) this quietly does nothing, and in-app notifications still work.
export async function emailUser(userId: string, subject: string, lines: string[], href?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    const admin = createAdminClient();
    const [{ data: profile }, { data: userRes }] = await Promise.all([
      admin.from("profiles").select("display_name, email_notifications, banned_at").eq("id", userId).maybeSingle(),
      admin.auth.admin.getUserById(userId),
    ]);
    const email = userRes?.user?.email;
    if (!email || !profile || !profile.email_notifications || profile.banned_at) return;

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
    const link = href ? `${site}${href}` : site;
    const text = [`Hi ${profile.display_name},`, "", ...lines, "", link, "", "— 2fish", "A little is enough.", "", `Turn off email notifications: ${site}/settings`].join("\n");
    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1c1917">
        <p style="font-size:15px">Hi ${escapeHtml(profile.display_name)},</p>
        ${lines.map((l) => `<p style="font-size:15px;line-height:1.5">${escapeHtml(l)}</p>`).join("")}
        <p style="margin:24px 0">
          <a href="${link}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:14px">Open 2fish</a>
        </p>
        <p style="font-size:13px;color:#78716c">— 2fish · A little is enough.<br><a href="${site}/settings" style="color:#78716c">Turn off email notifications</a></p>
      </div>`;

    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "2fish <onboarding@resend.dev>",
      to: email,
      subject,
      text,
      html,
    });
  } catch (err) {
    // never let email problems break the action that triggered them
    console.error("email failed", err);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
