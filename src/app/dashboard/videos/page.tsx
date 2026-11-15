import type { Metadata } from "next";
import { VideosScreen } from "@/components/screens/videos";
import { requireUser } from "@/lib/app/queries";

export const metadata: Metadata = { title: "Videos" };

// Still a preview. The real version comes with the video pipeline.
export default async function VideosPage() {
  const { user } = await requireUser();
  return <VideosScreen email={user.email ?? ""} />;
}
