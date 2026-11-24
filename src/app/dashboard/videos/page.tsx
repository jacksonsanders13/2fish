import type { Metadata } from "next";
import { PostsView } from "@/components/app/posts";
import { AppShell, BackToDashboard, PageBody } from "@/components/app/shell";
import { requireUser } from "@/lib/app/queries";
import { isYmd } from "@/lib/pilot/dates";
import { getPostsPage } from "@/lib/pilot/queries";
import { scorePosts } from "@/lib/pilot/scores";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Posts" };

// The route stays /videos so old links keep working.
export default async function PostsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { user } = await requireUser();
  const { week } = await searchParams;
  const data = await getPostsPage(week && isYmd(week) ? week : undefined);
  const scores = await scorePosts(await createClient(), data.business.id, data.weekOf, data.today);
  const results = Object.fromEntries(scores.map((s) => [s.id, s.items]));
  return (
    <AppShell active="videos" email={user.email ?? ""}>
      <PageBody>
        <BackToDashboard />
        <PostsView userId={data.userId} weekOf={data.weekOf} uploads={data.uploads} posts={data.posts} results={results} />
      </PageBody>
    </AppShell>
  );
}
