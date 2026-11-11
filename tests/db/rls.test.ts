import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, type Db } from "./harness";

let db: Db;
let alice: string; // posts a need
let bob: string; // helps
let carol: string; // bystander
let admin: string;

const needFor = (poster: string, title = "Size 4 diapers") => ({
  poster_id: poster,
  title,
  description: "Any brand works. Two boxes would get us through the month.",
  category: "baby",
  zip: "27615",
  lat: 35.9,
  lng: -78.64,
});

async function insertNeed(user: string, overrides: Partial<ReturnType<typeof needFor>> = {}) {
  const n = { ...needFor(user), ...overrides };
  const rows = await db.as(
    user,
    `insert into needs (poster_id, title, description, category, zip, lat, lng)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [n.poster_id, n.title, n.description, n.category, n.zip, n.lat, n.lng],
  );
  return rows[0].id as string;
}

beforeAll(async () => {
  db = await createDb();
  alice = await db.createUser("alice@example.com", { display_name: "Alice" });
  bob = await db.createUser("bob@example.com", { display_name: "Bob" });
  carol = await db.createUser("carol@example.com");
  admin = await db.createUser("admin@example.com", { display_name: "Admin" });
  await db.sql(`update profiles set role = 'admin' where id = $1`, [admin]);
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe("profiles", () => {
  it("creates a profile when an auth user is created", async () => {
    const rows = await db.sql(`select display_name from profiles where id = $1`, [alice]);
    expect(rows[0].display_name).toBe("Alice");
    const c = await db.sql(`select display_name from profiles where id = $1`, [carol]);
    expect(c[0].display_name).toBe("carol"); // falls back to the email prefix
  });

  it("only lets you read your own row from the base table", async () => {
    const mine = await db.as(alice, `select id from profiles`);
    expect(mine.map((r) => r.id)).toEqual([alice]);
    const anon = await db.as(null, `select id from profiles`);
    expect(anon).toHaveLength(0);
  });

  it("exposes only safe columns through public_profiles", async () => {
    await db.as(alice, `update profiles set zip = '27615', lat = 35.9, lng = -78.64 where id = $1`, [alice]);
    const rows = await db.as(null, `select * from public_profiles where id = $1`, [alice]);
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0]).sort()).toEqual(["area", "avatar_url", "created_at", "display_name", "id", "is_banned"]);
  });

  it("stops users from changing their own role or ban", async () => {
    await expect(db.as(alice, `update profiles set role = 'admin' where id = $1`, [alice])).rejects.toThrow(/permission denied/);
    await expect(db.as(alice, `update profiles set banned_at = null where id = $1`, [alice])).rejects.toThrow(/permission denied/);
  });

  it("stops users from editing someone else's profile", async () => {
    await db.as(bob, `update profiles set display_name = 'Hacked' where id = $1`, [alice]);
    const rows = await db.sql(`select display_name from profiles where id = $1`, [alice]);
    expect(rows[0].display_name).toBe("Alice");
  });
});

describe("needs", () => {
  let needId: string;

  it("lets a signed-in user post a need, and everyone read it", async () => {
    needId = await insertNeed(alice);
    const anon = await db.as(null, `select title, status from needs where id = $1`, [needId]);
    expect(anon[0]).toMatchObject({ title: "Size 4 diapers", status: "open" });
  });

  it("rejects posting as someone else", async () => {
    await expect(insertNeed(bob, { poster_id: alice })).rejects.toThrow(/row-level security/);
  });

  it("rejects a wishlist fulfillment without a link", async () => {
    await expect(
      db.as(alice, `insert into needs (poster_id, title, description, category, zip, lat, lng, fulfillment)
        values ($1, 'Coat', 'Winter coat size 10/12 please', 'clothing', '27615', 35.9, -78.64, 'wishlist')`, [alice]),
    ).rejects.toThrow(/check constraint/);
  });

  it("blocks direct status changes even by the owner", async () => {
    await expect(db.as(alice, `update needs set status = 'fulfilled' where id = $1`, [needId])).rejects.toThrow(/permission denied/);
    await expect(db.as(alice, `update needs set helper_id = $2 where id = $1`, [needId, bob])).rejects.toThrow(/permission denied/);
  });

  it("lets the owner edit the text but not other people", async () => {
    await db.as(alice, `update needs set title = 'Size 4 diapers, 2 boxes' where id = $1`, [needId]);
    await db.as(bob, `update needs set title = 'nope' where id = $1`, [needId]);
    const rows = await db.sql(`select title from needs where id = $1`, [needId]);
    expect(rows[0].title).toBe("Size 4 diapers, 2 boxes");
  });

  it("enforces the open-needs cap", async () => {
    for (let i = 0; i < 5; i++) await insertNeed(carol, { title: `Need ${i}` });
    await expect(insertNeed(carol, { title: "one too many" })).rejects.toThrow(/5 open needs/);
  });
});

describe("giving flow", () => {
  let needId: string;
  let threadId: string;

  beforeAll(async () => {
    needId = await insertNeed(alice, { title: "Groceries for the week" });
  });

  it("won't let you help your own need", async () => {
    await expect(db.as(alice, `select offer_help($1)`, [needId])).rejects.toThrow(/own need/);
  });

  it("won't let anonymous users offer", async () => {
    await expect(db.as(null, `select offer_help($1)`, [needId])).rejects.toThrow(/permission denied/);
  });

  it("lets a neighbor offer help: need pledged, thread + notification created", async () => {
    const rows = await db.as(bob, `select (offer_help($1)).id as id`, [needId]);
    threadId = rows[0].id as string;
    const need = await db.sql(`select status, helper_id from needs where id = $1`, [needId]);
    expect(need[0]).toMatchObject({ status: "pledged", helper_id: bob });
    const notes = await db.as(alice, `select type, href from notifications where user_id = $1`, [alice]);
    expect(notes.some((n) => n.type === "offer_received" && n.href === `/messages/${threadId}`)).toBe(true);
  });

  it("only allows one helper per need", async () => {
    await expect(db.as(carol, `select offer_help($1)`, [needId])).rejects.toThrow(/already offered/);
  });

  it("keeps the thread private to its two participants", async () => {
    expect(await db.as(alice, `select id from threads where id = $1`, [threadId])).toHaveLength(1);
    expect(await db.as(bob, `select id from threads where id = $1`, [threadId])).toHaveLength(1);
    expect(await db.as(carol, `select id from threads where id = $1`, [threadId])).toHaveLength(0);
  });

  it("delivers messages between participants and nobody else", async () => {
    await db.as(bob, `select send_message($1, $2)`, [threadId, "Hi Alice, I can drop these off Saturday at the library."]);
    await db.as(alice, `select send_message($1, $2)`, [threadId, "That works, thank you!"]);
    expect(await db.as(alice, `select body from messages where thread_id = $1`, [threadId])).toHaveLength(2);
    expect(await db.as(carol, `select body from messages where thread_id = $1`, [threadId])).toHaveLength(0);
    await expect(db.as(carol, `select send_message($1, 'let me in')`, [threadId])).rejects.toThrow(/not part/);
    // direct inserts are not allowed, even for participants
    await expect(
      db.as(bob, `insert into messages (thread_id, sender_id, body) values ($1, $2, 'sneaky')`, [threadId, bob]),
    ).rejects.toThrow(/row-level security/);
  });

  it("only notifies once per thread until read", async () => {
    await db.as(bob, `select send_message($1, 'one more thing')`, [threadId]);
    await db.as(bob, `select send_message($1, 'and another')`, [threadId]);
    const notes = await db.as(alice, `select id from notifications where user_id = $1 and type = 'message_received' and read_at is null`, [alice]);
    expect(notes).toHaveLength(1);
    await db.as(alice, `select mark_thread_read($1)`, [threadId]);
    const after = await db.as(alice, `select id from notifications where user_id = $1 and type = 'message_received' and read_at is null`, [alice]);
    expect(after).toHaveLength(0);
  });

  it("lets only the poster mark fulfilled, and thanks the helper", async () => {
    await expect(db.as(bob, `select mark_fulfilled($1)`, [needId])).rejects.toThrow(/Only the poster/);
    await db.as(alice, `select mark_fulfilled($1)`, [needId]);
    const need = await db.sql(`select status from needs where id = $1`, [needId]);
    expect(need[0].status).toBe("fulfilled");
    const notes = await db.as(bob, `select type from notifications where user_id = $1`, [bob]);
    expect(notes.some((n) => n.type === "need_fulfilled")).toBe(true);
  });

  it("hides fulfilled needs from the public but not from the people involved", async () => {
    expect(await db.as(null, `select id from needs where id = $1`, [needId])).toHaveLength(0);
    expect(await db.as(carol, `select id from needs where id = $1`, [needId])).toHaveLength(0);
    expect(await db.as(alice, `select id from needs where id = $1`, [needId])).toHaveLength(1);
    expect(await db.as(bob, `select id from needs where id = $1`, [needId])).toHaveLength(1);
  });

  it("lets a helper cancel, which reopens the need", async () => {
    const id = await insertNeed(alice, { title: "Winter coat" });
    await db.as(bob, `select offer_help($1)`, [id]);
    await expect(db.as(carol, `select cancel_offer($1)`, [id])).rejects.toThrow(/active offer/);
    await db.as(bob, `select cancel_offer($1)`, [id]);
    const need = await db.sql(`select status, helper_id from needs where id = $1`, [id]);
    expect(need[0]).toMatchObject({ status: "open", helper_id: null });
  });
});

describe("blocking", () => {
  it("hides needs between blocked users and stops offers and messages", async () => {
    const dave = await db.createUser("dave@example.com", { display_name: "Dave" });
    const id = await insertNeed(alice, { title: "School supplies" });
    await db.as(alice, `select block_user($1)`, [dave]);
    expect(await db.as(dave, `select id from needs where id = $1`, [id])).toHaveLength(0);
    await expect(db.as(dave, `select offer_help($1)`, [id])).rejects.toThrow(/can't help/);
    // and the other direction: dave's posts are hidden from alice
    const daveNeed = await insertNeed(dave, { title: "Dave needs a thing" });
    expect(await db.as(alice, `select id from needs where id = $1`, [daveNeed])).toHaveLength(0);
    expect(await db.as(carol, `select id from needs where id = $1`, [daveNeed])).toHaveLength(1);
  });
});

describe("nearby_needs", () => {
  it("returns distance, filters by radius, and hides fulfilled needs", async () => {
    const far = await insertNeed(bob, { title: "Far away need", zip: "90210", lat: 34.09, lng: -118.41 });
    const rows = await db.as(null, `select title, distance_miles from nearby_needs(35.9, -78.64, 25)`);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((r) => r.title === "Far away need")).toBe(false);
    expect(rows.every((r) => (r.distance_miles as number) <= 25)).toBe(true);
    const all = await db.as(null, `select title from nearby_needs(35.9, -78.64, null)`);
    expect(all.some((r) => r.title === "Far away need")).toBe(true);
    const search = await db.as(null, `select title from nearby_needs(null, null, null, null, null, 'far away')`);
    expect(search.map((r) => r.title)).toEqual(["Far away need"]);
    const byCat = await db.as(null, `select title from nearby_needs(null, null, null, 'clothing')`);
    expect(byCat.every((r) => r.title !== "Far away need")).toBe(true);
    await db.sql(`delete from needs where id = $1`, [far]);
  });
});

describe("admin", () => {
  it("rejects admin functions for regular users", async () => {
    await expect(db.as(alice, `select admin_ban_user($1, true)`, [bob])).rejects.toThrow(/Admins only/);
  });

  it("lets admins ban, which closes the user's open needs", async () => {
    const eve = await db.createUser("eve@example.com", { display_name: "Eve" });
    const id = await insertNeed(eve, { title: "Eve's need" });
    await db.as(admin, `select admin_ban_user($1, true)`, [eve]);
    const need = await db.sql(`select status from needs where id = $1`, [id]);
    expect(need[0].status).toBe("closed");
    await expect(insertNeed(eve, { title: "try again" })).rejects.toThrow(/can't post/);
  });

  it("lets users file reports and only admins read them all", async () => {
    const id = await insertNeed(alice, { title: "Reported need" });
    await db.as(bob, `insert into reports (reporter_id, target_type, target_id, reason) values ($1, 'need', $2, 'spam')`, [bob, id]);
    await expect(
      db.as(carol, `insert into reports (reporter_id, target_type, target_id, reason) values ($1, 'need', $2, 'spam')`, [bob, id]),
    ).rejects.toThrow(/row-level security/);
    expect(await db.as(carol, `select id from reports`)).toHaveLength(0);
    expect((await db.as(admin, `select id from reports`)).length).toBeGreaterThan(0);
  });
});
