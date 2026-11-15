import type { Metadata } from "next";
import { AppShell, PageBody } from "@/components/app/shell";
import { TextBackView } from "@/components/app/text-back";
import { getTextback, requireUser } from "@/lib/app/queries";
import { smsConfigured } from "@/lib/integrations/sms";

export const metadata: Metadata = { title: "Missed-call text-back" };

type Props = { searchParams: Promise<{ phone?: string }> };

export default async function TextBackPage({ searchParams }: Props) {
  const { user } = await requireUser();
  const { phone } = await searchParams;
  const { business, settings, conversations } = await getTextback();
  return (
    <AppShell active="text-back" email={user.email ?? ""}>
      <PageBody>
        <TextBackView
          business={business}
          settings={settings}
          conversations={conversations}
          smsConfigured={smsConfigured()}
          selectedPhone={phone}
        />
      </PageBody>
    </AppShell>
  );
}
