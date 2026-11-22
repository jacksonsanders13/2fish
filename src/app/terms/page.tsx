import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal";

export const metadata: Metadata = { title: "Terms" };

// Plain-English draft. Needs a lawyer's read before anyone pays.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="Nov 22, 2026"
      intro="These are the rules for using 2fish, written to be read. By creating an account or paying for a plan, you agree to them. You need to be 18 or older and using 2fish for a business."
      sections={[
        {
          heading: "What 2fish does",
          body: [
            "2fish turns the photos and clips you send into posts for your store and reports what they sold: how shoppers said they heard about you, sales of the items the posts showed, and your weekly sales. The free Store Grader scores your store and suggests fixes.",
            "Scores, estimates and calculator figures are estimates, not promises of sales.",
          ],
        },
        {
          heading: "Your plan and billing",
          body: [
            "Plans are billed monthly, or yearly if you pick that. They renew until you cancel.",
            "You can cancel any time in Settings. You keep your plan until the end of the period you already paid for. We don't refund partial months.",
            "We'll tell you at least 30 days before any price change on your plan.",
            "The price you see is the price you pay, plus any sales tax your state requires. No setup fees.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "Cancel any time and you won't be charged again. We don't refund the month you're in.",
            "If we charged you by mistake, email hello@join2fish.com and we'll refund it.",
          ],
        },
        {
          heading: "Your photos and posts",
          body: [
            "You own the photos, clips and store details you send us. You give 2fish permission to edit them into posts and to share them on the accounts you connect, only for your store.",
            "Only send things you have the right to use. That includes photos of other people, music and other brands' products.",
            "Captions are written with AI from your photos and notes. Read each post before you approve it. Nothing is posted without your approval, and you're responsible for posts once you approve them.",
            "If you connect Square, 2fish only reads your sales. It can't change anything in Square. You can disconnect in Settings any time.",
            "If you add a mobile number, 2fish texts you about your account. Message and data rates may apply. Reply STOP to stop.",
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
