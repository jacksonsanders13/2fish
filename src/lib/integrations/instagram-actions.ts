"use server";

import { revalidatePath } from "next/cache";
import { ensureBusiness } from "@/lib/app/queries";
import { disconnectInstagram } from "./instagram";

export async function disconnectInstagramNow(): Promise<{ ok: boolean }> {
  const { business } = await ensureBusiness();
  await disconnectInstagram(business.id);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
