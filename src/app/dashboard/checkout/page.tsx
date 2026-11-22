import type { Metadata } from "next";
import { CheckoutView } from "@/components/app/checkout";
import { AppShell, PageBody } from "@/components/app/shell";
import { requireUser } from "@/lib/app/queries";
import { getCheckoutPage } from "@/lib/pilot/queries";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { user } = await requireUser();
  const data = await getCheckoutPage();
  return (
    <AppShell active="checkout" email={user.email ?? ""}>
      <PageBody>
        <CheckoutView checkouts={data.checkouts} posts={data.posts} />
      </PageBody>
    </AppShell>
  );
}
