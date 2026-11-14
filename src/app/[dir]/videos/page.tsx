import type { Metadata } from "next";
import { VideosScreen } from "@/components/screens/videos";
import { getDir } from "@/lib/dir";

export const metadata: Metadata = { title: "Videos" };

type Props = { params: Promise<{ dir: string }> };

export default async function VideosPage({ params }: Props) {
  const dir = await getDir(params);
  return <VideosScreen dir={dir} />;
}
