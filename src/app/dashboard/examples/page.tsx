import type { Metadata } from "next";
import { ExamplesView } from "@/components/app/examples";
import { AppShell, PageBody } from "@/components/app/shell";
import { requireUser } from "@/lib/app/queries";
import { canAddGlobal } from "@/lib/pilot/examples";
import { getExamplesPage } from "@/lib/pilot/queries";

export const metadata: Metadata = { title: "Post examples" };

export default async function ExamplesPage() {
  const { user } = await requireUser();
  const [{ examples }, canShare] = await Promise.all([getExamplesPage(), canAddGlobal()]);
  return (
    <AppShell active="examples" email={user.email ?? ""}>
      <PageBody>
        <ExamplesView examples={examples} canShare={canShare} />
      </PageBody>
    </AppShell>
  );
}
