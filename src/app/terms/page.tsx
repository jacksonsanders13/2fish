import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal";

export const metadata: Metadata = { title: "Terms" };

// Plain-English draft. Needs a lawyer's read before anyone pays.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="Nov 22, 2026"
      intro="These are the rules for using 2fish, written to be read. By creating an account or paying for a plan, you agree to them."
      sections={[
        {
          heading: "What 2fish does",
          body: [
            "2fish turns the photos and clips you send into posts for your store, puts a promo code on each one, and reports the sales logged with those codes. The free Store Grader scores your store and suggests fixes.",
            "Scores, estimates and calculator figures are estimates, not promises of sales.",
          ],
        },
        {
          heading: "Your plan and billing",
          body: [
            "Plans are billed monthly, or yearly if you pick that. They renew until you cancel.",
            "You can cancel any time in Settings. You keep your plan until the end of the period you already paid for. We don't refund partial months.",
            "The founding price of $49 a month is for the first 10 stores we sign. It stays at $49 for as long as that subscription stays active. If you cancel and come back later, current prices apply.",
            "We'll tell you at least 30 days before any price change on your plan.",
          ],
        },
        {
          heading: "The 60-day guarantee",
          body: [
            "If the tracked sales from your 2fish codes in your first 60 days on a paid plan add up to less than what you paid for those 60 days, your next month is free.",
            "Tracked sales means sales logged in 2fish with one of your 2fish promo codes. To qualify, the posts you approved need to go up, and sales with codes need to be logged when they happen.",
            "The guarantee is one free month, once per store. It isn't a cash refund.",
          ],
        },
        {
          heading: "Promo codes",
          body: [
            "The discount on each code is your store's offer. You choose it, you honor it at your register, and you cover its cost.",
            "You can change or end a code's discount any time. Tell your shoppers if you do.",
          ],
        },
        {
          heading: "Your photos and posts",
          body: [
            "You own the photos, clips and store details you send us. You give 2fish permission to edit them into posts and to share them on the accounts you connect, only for your store.",
            "Only send things you have the right to use. That includes photos of other people, music and other brands' products.",
            "Nothing is posted without your approval. You're responsible for posts once you approve them.",
          ],
        },
        {
          heading: "Fair use",
          body: [
            "Don't use 2fish to post anything illegal, misleading or hateful, or to break the rules of Instagram, Facebook, TikTok or Google. We can pause or close an account that does.",
          ],
        },
        {
          heading: "If something goes wrong",
          body: [
            "We work hard to keep 2fish running and your posts on time, but we can't promise it will never be down or never make a mistake.",
            "As far as the law allows, our total responsibility to you is limited to what you paid us in the 3 months before the problem.",
          ],
        },
        {
          heading: "Changes and contact",
          body: [
            "If these terms change, we'll update the date at the top and tell you by email before the change affects a paid plan.",
            "These terms follow the laws of North Carolina.",
            "Questions: hello@join2fish.com",
          ],
        },
      ]}
    />
  );
}
