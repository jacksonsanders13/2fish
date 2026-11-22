import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal";

export const metadata: Metadata = { title: "Privacy" };

// Plain-English draft. Needs a lawyer's read before anyone pays.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="Nov 22, 2026"
      intro="What 2fish keeps about you and your store, why, and how to get it back or delete it."
      sections={[
        {
          heading: "What we keep",
          body: [
            "Your account: your email and a password, or the Google, Apple or Microsoft account you sign in with.",
            "Your store: its name, city, Instagram handle and the answers you give in the Store Grader.",
            "Your content: the photos and clips you upload and the posts made from them.",
            "Your sales: the promo codes logged at your register, the sale amounts, and any sales numbers you type in. We don't need your shoppers' names for any of this.",
            "Your chats with the 2fish assistant.",
          ],
        },
        {
          heading: "What we use it for",
          body: [
            "To make your posts, run your codes, build your reports and keep your account working. That's it.",
            "We don't sell your information, and we don't show you ads.",
          ],
        },
        {
          heading: "Who helps us run 2fish",
          body: [
            "A few companies process your information for us: Supabase stores the data, Vercel hosts the site, Anthropic writes captions and chat replies, and Stripe will handle payments. Once you connect Instagram, Facebook, TikTok or Google, your approved posts go to them.",
            "Each only gets what it needs for its part.",
          ],
        },
        {
          heading: "Keeping it safe",
          body: [
            "Your store's information is only visible to your account. Uploads are stored privately. Passwords are never stored in plain text.",
          ],
        },
        {
          heading: "Getting it back or deleting it",
          body: [
            "In Settings you can download everything 2fish has about your store, or delete your account. Deleting removes your store, uploads, posts, codes and chats.",
          ],
        },
        {
          heading: "Contact",
          body: ["Questions about your information: hello@join2fish.com"],
        },
      ]}
    />
  );
}
