import { notFound } from "next/navigation";
import { DIRS, isDir, type Dir } from "./format";

/** Read the /a or /b segment from a page's params, 404 on anything else. */
export async function getDir(params: Promise<{ dir: string }>): Promise<Dir> {
  const { dir } = await params;
  if (!isDir(dir)) notFound();
  return dir;
}

export function dirParams() {
  return DIRS.map((dir) => ({ dir }));
}
