"use server";

import { revalidatePath } from "next/cache";
import { ensureBusiness } from "@/lib/app/queries";
import { disconnectSquare, syncSquare } from "./square";

export async function syncSquareNow(): Promise<{ ok: boolean; message: string }> {
  const { business } = await ensureBusiness();
  const r = await syncSquare(business.id, 14);
  revalidatePath("/dashboard", "layout");
  return { ok: r.ok, message: r.ok ? `Synced. ${r.orders} sales from the last 2 weeks.` : r.message ?? "Sync failed." };
}

export async function disconnectSquareNow(): Promise<{ ok: boolean }> {
  const { business } = await ensureBusiness();
  await disconnectSquare(business.id);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
