import type { Metadata } from "next";
import PostView from "@/components/PostView";

export const metadata: Metadata = { title: "Post a need · 2fish" };

export default function PostPage() {
  return <PostView />;
}
