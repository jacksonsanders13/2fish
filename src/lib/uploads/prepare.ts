"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

// Every photo goes through here before it leaves the phone:
// - photos only (no video for now),
// - turned upright and shrunk to Instagram's size (1080 wide, 1350 tall at most),
// - re-saved as JPEG, the only format Instagram's API takes,
// - which also drops the hidden phone data (GPS location, camera serial).
// Supabase refuses anything else on its own side too (photos only, 10 MB, 60 a week).

const MAX_W = 1080;
const MAX_H = 1350;
const MAX_IN = 30 * 1024 * 1024; // what we'll even try to open

export async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) throw new Error(`${file.name} isn't a photo. Videos aren't supported yet.`);
  if (file.size > MAX_IN) throw new Error(`${file.name} is too big to open.`);
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Couldn't open ${file.name}. If it's an iPhone HEIC photo, share it as "Most Compatible" or JPEG and try again.`);
  }
  if (bmp.width < 320 || bmp.height < 320) throw new Error(`${file.name} is too small to post. Send the full-size photo.`);
  const scale = Math.min(1, MAX_W / bmp.width, MAX_H / bmp.height);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process the photo.");
  ctx.fillStyle = "#fff"; // transparent PNGs get a white background, not black
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!blob) throw new Error("Your browser couldn't process the photo.");
  return blob;
}

/** Prepares and uploads photos into one folder. Returns what made it and what didn't, and why. */
export async function uploadPhotos(
  supabase: SupabaseClient,
  folder: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ paths: string[]; problems: string[] }> {
  const paths: string[] = [];
  const problems: string[] = [];
  for (const [i, f] of files.entries()) {
    onProgress?.(i, files.length);
    try {
      const blob = await prepareImage(f);
      const base = f.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_").slice(0, 60) || "photo";
      const path = `${folder}/${Date.now()}-${base}.jpg`;
      const { error } = await supabase.storage.from("clips").upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) {
        // The weekly cap lives in a storage rule, so it comes back as a permission error.
        problems.push(/row-level security|policy|unauthorized/i.test(error.message) ? "You've hit this week's limit of 60 photos." : `${f.name}: ${error.message}`);
        if (problems.at(-1)?.startsWith("You've hit")) break;
        continue;
      }
      paths.push(path);
    } catch (e) {
      problems.push(e instanceof Error ? e.message : `${f.name} didn't upload.`);
    }
  }
  onProgress?.(files.length, files.length);
  return { paths, problems };
}
