import { adminClient } from "@/lib/supabase/admin";

// Square: OAuth connect, then a sync that turns completed orders into daily
// totals and per-item counts. Read-only scopes. Nothing here changes the store's Square account.

const VERSION = "2024-10-17";
export const SCOPES = ["ORDERS_READ", "ITEMS_READ", "MERCHANT_PROFILE_READ"];

export function squareConfig() {
  const appId = process.env.SQUARE_APP_ID;
  const secret = process.env.SQUARE_APP_SECRET;
  if (!appId || !secret) return null;
  const sandbox = (process.env.SQUARE_ENV ?? "production") === "sandbox";
  return { appId, secret, base: sandbox ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com" };
}

export function squareReady() {
  return Boolean(squareConfig() && process.env.SUPABASE_SECRET_KEY);
}

export function authorizeUrl(state: string) {
  const c = squareConfig();
  if (!c) return null;
  const q = new URLSearchParams({ client_id: c.appId, scope: SCOPES.join(" "), session: "false", state });
  return `${c.base}/oauth2/authorize?${q}`;
}

type TokenResponse = { access_token: string; refresh_token: string; expires_at: string; merchant_id: string };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const c = squareConfig();
  if (!c) throw new Error("Square isn't set up yet.");
  const res = await fetch(`${c.base}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Square-Version": VERSION },
    body: JSON.stringify({ client_id: c.appId, client_secret: c.secret, ...body }),
    signal: AbortSignal.timeout(20_000),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.detail ?? json?.message ?? "Square said no.");
  return json as TokenResponse;
}

/** Swap the code from Square's redirect for tokens and save them. */
export async function connectSquare(code: string, businessId: string, ownerId: string) {
  const admin = adminClient();
  if (!admin) throw new Error("Square isn't set up yet.");
  const t = await tokenRequest({ code, grant_type: "authorization_code" });
  const { error } = await admin.from("square_connections").upsert({
    business_id: businessId,
    owner_id: ownerId,
    merchant_id: t.merchant_id,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: t.expires_at,
    connected_at: new Date().toISOString(),
    last_error: null,
  });
  if (error) throw error;
  await admin.from("businesses").update({ square_connected_at: new Date().toISOString() }).eq("id", businessId);
}

export async function disconnectSquare(businessId: string) {
  const admin = adminClient();
  if (!admin) return;
  await admin.from("square_connections").delete().eq("business_id", businessId);
  await admin.from("businesses").update({ square_connected_at: null }).eq("id", businessId);
}

type Conn = { business_id: string; owner_id: string; access_token: string; refresh_token: string; expires_at: string };

async function freshToken(conn: Conn) {
  // Access tokens last 30 days. Refresh when there's less than a week left.
  if (new Date(conn.expires_at).getTime() - Date.now() > 7 * 86400_000) return conn.access_token;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: conn.refresh_token });
  await adminClient()!
    .from("square_connections")
    .update({ access_token: t.access_token, refresh_token: t.refresh_token || conn.refresh_token, expires_at: t.expires_at })
    .eq("business_id", conn.business_id);
  return t.access_token;
}

async function api<T>(token: string, path: string, body?: unknown): Promise<T> {
  const c = squareConfig()!;
  const res = await fetch(`${c.base}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Square-Version": VERSION },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.detail ?? `Square ${res.status}`);
  return json as T;
}

type Money = { amount?: number } | undefined;
type Order = {
  closed_at?: string;
  total_money?: Money;
  total_tax_money?: Money;
  line_items?: { name?: string; quantity?: string; total_money?: Money; total_tax_money?: Money }[];
};

const cents = (m: Money) => m?.amount ?? 0;

/** Pull the last `days` days of completed orders into sales_daily and item_daily. */
export async function syncSquare(businessId: string, days = 3): Promise<{ ok: boolean; orders: number; message?: string }> {
  const admin = adminClient();
  if (!admin || !squareConfig()) return { ok: false, orders: 0, message: "Square isn't set up yet." };
  const { data: conn } = await admin.from("square_connections").select("*").eq("business_id", businessId).maybeSingle();
  if (!conn) return { ok: false, orders: 0, message: "Square isn't connected." };
  const { data: biz } = await admin.from("businesses").select("timezone").eq("id", businessId).single();
  const tz = (biz?.timezone as string) || "America/New_York";

  try {
    const token = await freshToken(conn as Conn);
    const { locations = [] } = await api<{ locations?: { id: string; status?: string }[] }>(token, "/v2/locations");
    const locationIds = locations.filter((l) => l.status !== "INACTIVE").map((l) => l.id).slice(0, 10);
    if (!locationIds.length) return { ok: true, orders: 0 };

    const start = new Date(Date.now() - days * 86400_000).toISOString();
    const dayOf = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
    const daily = new Map<string, { total: number; orders: number }>();
    const items = new Map<string, { day: string; item: string; qty: number; amount: number }>();
    let cursor: string | undefined;
    let count = 0;

    do {
      const page = await api<{ orders?: Order[]; cursor?: string }>(token, "/v2/orders/search", {
        location_ids: locationIds,
        limit: 500,
        cursor,
        query: {
          filter: { state_filter: { states: ["COMPLETED"] }, date_time_filter: { closed_at: { start_at: start } } },
          sort: { sort_field: "CLOSED_AT", sort_order: "ASC" },
        },
      });
      for (const o of page.orders ?? []) {
        if (!o.closed_at) continue;
        count++;
        const day = dayOf(o.closed_at);
        const d = daily.get(day) ?? { total: 0, orders: 0 };
        d.total += cents(o.total_money) - cents(o.total_tax_money);
        d.orders += 1;
        daily.set(day, d);
        for (const li of o.line_items ?? []) {
          const name = (li.name ?? "").trim().slice(0, 120);
          if (!name) continue;
          const k = `${day}|${name.toLowerCase()}`;
          const it = items.get(k) ?? { day, item: name, qty: 0, amount: 0 };
          it.qty += Number(li.quantity ?? 0) || 0;
          it.amount += cents(li.total_money) - cents(li.total_tax_money);
          items.set(k, it);
        }
      }
      cursor = page.cursor;
    } while (cursor && count < 20000);

    const owner = conn.owner_id as string;
    if (daily.size) {
      const { error } = await admin.from("sales_daily").upsert(
        [...daily].map(([day, d]) => ({ business_id: businessId, owner_id: owner, day, total: Math.round(d.total / 100), orders: d.orders })),
      );
      if (error) throw error;
    }
    const rows = [...items.values()].map((r) => ({ business_id: businessId, owner_id: owner, day: r.day, item: r.item, qty: r.qty, amount: Math.round(r.amount / 100) }));
    for (let i = 0; i < rows.length; i += 1000) {
      const { error } = await admin.from("item_daily").upsert(rows.slice(i, i + 1000));
      if (error) throw error;
    }
    await admin.from("square_connections").update({ last_error: null }).eq("business_id", businessId);
    await admin.from("businesses").update({ square_synced_at: new Date().toISOString() }).eq("id", businessId);
    return { ok: true, orders: count };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed.";
    await admin.from("square_connections").update({ last_error: message }).eq("business_id", businessId);
    return { ok: false, orders: 0, message };
  }
}

/** Every connected store, for the daily cron. */
export async function syncAll() {
  const admin = adminClient();
  if (!admin) return [];
  const { data } = await admin.from("square_connections").select("business_id");
  const out = [];
  for (const row of data ?? []) out.push({ business: row.business_id, ...(await syncSquare(row.business_id, 3)) });
  return out;
}
