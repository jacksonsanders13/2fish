import type { Metadata } from "next";
import { VideosScreen } from "@/components/screens/videos";

export const metadata: Metadata = { title: "Videos" };

export default function VideosPage() {
  return <VideosScreen />;
}
