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
            "If you join the waitlist: your email, and your store name and plan if you give them. We only use them to tell you when 2fish opens.",
            "Your account: your email and a password, or the Google, Apple or Microsoft account you sign in with.",
            "Your store: its name, city, Instagram handle and the answers you give in the Store Grader.",
            "Your content: the photos and clips you upload and the posts made from them.",
            "Your sales: how shoppers said they heard about you, the sale amounts, counts of the items your posts showed, and the weekly sales numbers you type in. We don't need your shoppers' names for any of this.",
            "Your chats with the 2fish assistant.",
            "If you connect Square: your daily sales totals and how many of each item sold. We only ask Square for read access and never see your customers' card details.",
            "If you add a mobile number: we use it only to text you about your own account (posts ready, photos needed). Reply STOP to any text to stop them.",
          ],
        },
        {
          heading: "What we use it for",
          body: [
            "To make your posts, build your reports and keep your account working. That's it.",
            "We don't sell your information, and we don't show you ads.",
          ],
        },
        {
          heading: "Who helps us run 2fish",
          body: [
            "A few companies process your information for us: Supabase stores the data, Vercel hosts the site, Anthropic writes captions and chat replies from your photos and notes, Square sends your sales (if you connect it), Twilio sends texts (if you add a mobile number), and Stripe will handle payments. Once you connect Instagram, Facebook, TikTok or Google, your approved posts go to them.",
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
            "In Settings you can download everything 2fish has about your store, or delete your account. Deleting removes your store, uploads, posts, sales numbers, chats and your Square connection.",
            "You can also email hello@join2fish.com and we'll delete it for you within 30 days.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We only use the cookies the site needs to work: keeping you signed in, holding your Store Grader answers until you save them, and protecting the Square connect step. No ad or tracking cookies, so there's nothing to opt out of.",
          ],
        },
        {
          heading: "Kids",
          body: [
            "2fish is for store owners and isn't meant for anyone under 18. We don't knowingly collect information from children. If you think a child signed up, email us and we'll delete it.",
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
