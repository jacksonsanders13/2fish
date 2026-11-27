import { adminClient } from "@/lib/supabase/admin";
import { looksLikeImage } from "@/lib/pilot/types";
import { todayIn } from "@/lib/pilot/dates";

// Instagram: the owner connects their business account once (Instagram API with
// Instagram Login), then the morning cron posts every approved post whose day
// has come. Only approved posts, only from the owner's own photos and clips.
// Needs Meta app review for instagram_business_content_publish before it works
// for stores other than the app's own testers.

const GRAPH = "https://graph.instagram.com/v21.0";
export const IG_SCOPES = ["instagram_business_basic", "instagram_business_content_publish"];

export function instagramConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const secret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !secret) return null;
  return { appId, secret };
}

export function instagramReady() {
  return Boolean(instagramConfig() && process.env.SUPABASE_SECRET_KEY);
}

export function igAuthorizeUrl(state: string, redirectUri: string) {
  const c = instagramConfig();
  if (!c) return null;
  const q = new URLSearchParams({
    client_id: c.appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: IG_SCOPES.join(","),
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${q}`;
}

async function igJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message ?? json?.error_message ?? "Instagram said no.");
  return json;
}

/** Swap the code for a long-lived token (60 days) and save it. */
export async function connectInstagram(code: string, redirectUri: string, businessId: string, ownerId: string) {
  const c = instagramConfig();
  const admin = adminClient();
  if (!c || !admin) throw new Error("Instagram isn't set up yet.");

  const short = await igJson(
    await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({ client_id: c.appId, client_secret: c.secret, grant_type: "authorization_code", redirect_uri: redirectUri, code }),
      signal: AbortSignal.timeout(20_000),
    }),
  );
  const long = await igJson(
    await fetch(`https://graph.instagram.com/access_token?${new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: c.secret, access_token: short.access_token })}`, {
      signal: AbortSignal.timeout(20_000),
    }),
  );
  const me = await igJson(
    await fetch(`${GRAPH}/me?${new URLSearchParams({ fields: "user_id,username", access_token: long.access_token })}`, { signal: AbortSignal.timeout(20_000) }),
  );

  const now = new Date().toISOString();
  const { error } = await admin.from("instagram_connections").upsert({
    business_id: businessId,
    owner_id: ownerId,
    ig_user_id: String(me.user_id ?? short.user_id),
    username: me.username ?? null,
    access_token: long.access_token,
    expires_at: new Date(Date.now() + Number(long.expires_in ?? 5_184_000) * 1000).toISOString(),
    connected_at: now,
    last_error: null,
  });
  if (error) throw error;
  await admin.from("businesses").update({ instagram_connected_at: now, instagram_username: me.username ?? null }).eq("id", businessId);
}

export async function disconnectInstagram(businessId: string) {
  const admin = adminClient();
  if (!admin) return;
  await admin.from("instagram_connections").delete().eq("business_id", businessId);
  await admin.from("businesses").update({ instagram_connected_at: null, instagram_username: null }).eq("id", businessId);
}

type Conn = { business_id: string; ig_user_id: string; access_token: string; expires_at: string };

async function freshToken(conn: Conn) {
  // Long-lived tokens last 60 days. Refresh when there's less than 10 left.
  if (new Date(conn.expires_at).getTime() - Date.now() > 10 * 86400_000) return conn.access_token;
  const t = await igJson(
    await fetch(`https://graph.instagram.com/refresh_access_token?${new URLSearchParams({ grant_type: "ig_refresh_token", access_token: conn.access_token })}`, {
      signal: AbortSignal.timeout(20_000),
    }),
  );
  await adminClient()!
    .from("instagram_connections")
    .update({ access_token: t.access_token, expires_at: new Date(Date.now() + Number(t.expires_in ?? 5_184_000) * 1000).toISOString() })
    .eq("business_id", conn.business_id);
  return t.access_token as string;
}

async function post(path: string, params: Record<string, string>) {
  return igJson(await fetch(`${GRAPH}/${path}`, { method: "POST", body: new URLSearchParams(params), signal: AbortSignal.timeout(30_000) }));
}

/** Put one post on Instagram. Videos go up as Reels and need a moment to process. */
async function publishOne(conn: Conn, token: string, mediaUrl: string, isImage: boolean, caption: string) {
  const container = await post(`${conn.ig_user_id}/media`, isImage
    ? { image_url: mediaUrl, caption, access_token: token }
    : { media_type: "REELS", video_url: mediaUrl, caption, access_token: token });

  if (!isImage) {
    // Wait up to about a minute for Instagram to finish the video.
    for (let i = 0; i < 12; i++) {
      const s = await igJson(await fetch(`${GRAPH}/${container.id}?${new URLSearchParams({ fields: "status_code", access_token: token })}`));
      if (s.status_code === "FINISHED") break;
      if (s.status_code === "ERROR") throw new Error("Instagram couldn't process the video.");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  const done = await post(`${conn.ig_user_id}/media_publish`, { creation_id: container.id, access_token: token });
  return String(done.id);
}

/**
 * The morning job: every approved post whose day is today (in the store's time
 * zone) or earlier this week goes up, if the store connected Instagram.
 */
export async function publishDuePosts() {
  const admin = adminClient();
  if (!admin || !instagramConfig()) return [];
  const { data: conns } = await admin.from("instagram_connections").select("business_id, ig_user_id, access_token, expires_at");
  const out: { post: string; ok: boolean; why?: string }[] = [];

  for (const conn of (conns ?? []) as Conn[]) {
    const { data: biz } = await admin.from("businesses").select("timezone").eq("id", conn.business_id).single();
    const today = todayIn((biz?.timezone as string) || "America/New_York");
    const { data: due } = await admin
      .from("posts")
      .select("id, caption, media_path, post_on")
      .eq("business_id", conn.business_id)
      .eq("status", "approved")
      .is("published_at", null)
      .lte("post_on", today)
      .order("post_on")
      .limit(3);

    let token: string;
    try {
      token = await freshToken(conn);
    } catch (e) {
      await admin.from("instagram_connections").update({ last_error: (e as Error).message }).eq("business_id", conn.business_id);
      continue;
    }

    for (const p of due ?? []) {
      try {
        if (!p.media_path) throw new Error("This post has no photo or video yet.");
        const isImage = looksLikeImage(p.media_path);
        if (isImage && !/\.(jpe?g)$/i.test(p.media_path)) throw new Error("Instagram only takes JPEG photos. Send this one as a .jpg.");
        const { data: signed } = await admin.storage.from("clips").createSignedUrl(p.media_path, 3600);
        if (!signed?.signedUrl) throw new Error("Couldn't open the photo.");
        const id = await publishOne(conn, token, signed.signedUrl, isImage, p.caption ?? "");
        await admin.from("posts").update({ status: "posted", published_at: new Date().toISOString(), ig_media_id: id, publish_error: null }).eq("id", p.id);
        out.push({ post: p.id, ok: true });
      } catch (e) {
        await admin.from("posts").update({ publish_error: (e as Error).message }).eq("id", p.id);
        out.push({ post: p.id, ok: false, why: (e as Error).message });
      }
    }
  }
  return out;
}
