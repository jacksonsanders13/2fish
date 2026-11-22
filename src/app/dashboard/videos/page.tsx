import type { Metadata } from "next";
import { PostsView } from "@/components/app/posts";
import { AppShell, PageBody } from "@/components/app/shell";
import { requireUser } from "@/lib/app/queries";
import { isYmd } from "@/lib/pilot/dates";
import { getPostsPage } from "@/lib/pilot/queries";

export const metadata: Metadata = { title: "Posts" };

// The route stays /videos so old links keep working.
export default async function PostsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { user } = await requireUser();
  const { week } = await searchParams;
  const data = await getPostsPage(week && isYmd(week) ? week : undefined);
  return (
    <AppShell active="videos" email={user.email ?? ""}>
      <PageBody>
        <PostsView userId={data.userId} weekOf={data.weekOf} uploads={data.uploads} posts={data.posts} />
      </PageBody>
    </AppShell>
  );
}
