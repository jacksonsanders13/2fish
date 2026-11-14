import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Admin = SupabaseClient<Database>;

// Permanently removes a person. Runs with the service role, so order matters:
// clean up what cascades won't (files in storage, other people's threads), then
// delete the auth user, which cascades to profile -> needs -> threads -> messages.
export async function deleteAccount(admin: Admin, userId: string) {
  // 1. active offers they made: reopen those needs for someone else
  await admin
    .from("needs")
    .update({ status: "open", helper_id: null, pledged_at: null } as never)
    .eq("helper_id", userId)
    .eq("status", "pledged");

  // 2. files: need photos and avatar
  const [{ data: needs }, { data: profile }] = await Promise.all([
    admin.from("needs").select("photo_path").eq("poster_id", userId),
    admin.from("profiles").select("avatar_url").eq("id", userId).maybeSingle(),
  ]);
  const photoPaths = (needs ?? []).map((n) => n.photo_path).filter((p): p is string => !!p);
  if (photoPaths.length) await admin.storage.from("need-photos").remove(photoPaths);
  if (profile?.avatar_url) await admin.storage.from("avatars").remove([profile.avatar_url]);
  // anything else left under their folders
  for (const bucket of ["need-photos", "avatars"] as const) {
    const { data: files } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
    if (files?.length) await admin.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
  }

  // 3. threads where they were the helper stay for the poster, with their side anonymized
  //    (messages.sender_id -> null and threads.helper_id -> null happen via ON DELETE SET NULL)
  //    threads on needs they posted go away with the need (ON DELETE CASCADE)

  // 4. the auth user. Cascades to profile, needs, notifications, blocks, thread_reads.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
