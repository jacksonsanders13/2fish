import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal";

export const metadata: Metadata = { title: "Delete your data" };

// Meta asks every app for a page like this (the "Data Deletion Instructions URL"
// in the app's settings). Plain steps, same promises as the privacy page.
export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Delete your data"
      updated="Nov 27, 2026"
      intro="How to remove everything 2fish has about you and your store, including anything that came from Instagram or Facebook."
      sections={[
        {
          heading: "Delete it yourself",
          body: [
            "Sign in, open Settings and go to Delete my account and type DELETE. That removes your store, uploads, posts, sales numbers, chats, and your Square and Instagram connections right away.",
            "Want a copy first? In Settings, choose Download my data before you delete.",
          ],
        },
        {
          heading: "Only disconnect Instagram",
          body: [
            "In Settings, choose Disconnect under Instagram. We delete the access key Instagram gave us, and nothing posts for you after that. Your posts already on Instagram stay there.",
            "You can also remove 2fish from inside Instagram: Settings, then Apps and websites, then remove 2fish. We stop posting as soon as Instagram tells us.",
          ],
        },
        {
          heading: "Ask us to do it",
          body: [
            "Email hello@join2fish.com from the address on your account and say \"delete my data\". We delete everything within 30 days and email you when it's done.",
          ],
        },
        {
          heading: "What we keep after",
          body: [
            "Nothing tied to you. If you ever paid, Stripe keeps its own payment records, because the law requires it.",
          ],
        },
      ]}
    />
  );
}
