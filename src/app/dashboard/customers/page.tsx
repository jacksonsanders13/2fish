import type { Metadata } from "next";
import { CustomersView } from "@/components/app/customers";
import { AppShell, PageBody } from "@/components/app/shell";
import { getCustomers, requireUser } from "@/lib/app/queries";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const { user } = await requireUser();
  const { customers, jobs } = await getCustomers();
  return (
    <AppShell active="customers" email={user.email ?? ""}>
      <PageBody>
        <CustomersView customers={customers} jobs={jobs} />
      </PageBody>
    </AppShell>
  );
}
