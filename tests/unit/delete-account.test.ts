import { describe, expect, it } from "vitest";
import { deleteAccount } from "@/lib/account/delete";

// A tiny fake of the service-role client that records what was called.
function fakeAdmin(opts: { photos?: string[]; avatar?: string | null; files?: Record<string, string[]>; deleteError?: Error } = {}) {
  const calls: string[] = [];
  const table = (name: string) => {
    const chain = {
      update: (v: unknown) => {
        calls.push(`update ${name} ${JSON.stringify(v)}`);
        return chain;
      },
      select: () => chain,
      eq: () => chain,
      maybeSingle: async () => ({ data: name === "profiles" ? { avatar_url: opts.avatar ?? null } : null }),
      then: (resolve: (v: unknown) => void) => {
        if (name === "needs") resolve({ data: (opts.photos ?? []).map((p) => ({ photo_path: p })) });
        else resolve({ data: null });
      },
    };
    return chain;
  };
  const storage = {
    from: (bucket: string) => ({
      remove: async (paths: string[]) => {
        calls.push(`remove ${bucket} ${paths.join(",")}`);
        return { data: null, error: null };
      },
      list: async () => ({ data: (opts.files?.[bucket] ?? []).map((name) => ({ name })), error: null }),
    }),
  };
  const auth = {
    admin: {
      deleteUser: async (id: string) => {
        calls.push(`deleteUser ${id}`);
        return { data: null, error: opts.deleteError ?? null };
      },
    },
  };
  return { client: { from: table, storage, auth } as never, calls };
}

describe("deleteAccount", () => {
  it("reopens needs they were helping with, removes files, then deletes the auth user", async () => {
    const { client, calls } = fakeAdmin({
      photos: ["u1/a.jpg", "u1/b.jpg"],
      avatar: "u1/me.png",
      files: { "need-photos": ["stray.jpg"], avatars: [] },
    });
    await deleteAccount(client, "u1");
    expect(calls[0]).toMatch(/update needs .*"status":"open".*"helper_id":null/);
    expect(calls).toContain("remove need-photos u1/a.jpg,u1/b.jpg");
    expect(calls).toContain("remove avatars u1/me.png");
    expect(calls).toContain("remove need-photos u1/stray.jpg");
    expect(calls[calls.length - 1]).toBe("deleteUser u1");
  });

  it("throws (and never reports success) if the auth user can't be deleted", async () => {
    const { client } = fakeAdmin({ deleteError: new Error("boom") });
    await expect(deleteAccount(client, "u1")).rejects.toThrow("boom");
  });
});
