import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The ground rules for using 2fish.",
};

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Terms of use" title="The ground rules." intro="Short, readable, and meant to be followed. Last updated November 2026.">
      <p className="callout">
        Draft for clarity, not yet reviewed by a lawyer. The intent won't change; some wording will.
      </p>

      <h2>1. What 2fish is</h2>
      <p>
        2fish is a bulletin board that connects people who need a specific item with neighbors who want to give it.
        We don't handle money, ship items, or guarantee that any need gets met. The handoff is between you and
        another person.
      </p>

      <h2>2. Who can use it</h2>
      <p>
        You must be 18 or older and able to agree to these terms. One account per person. Keep your sign-in details
        to yourself.
      </p>

      <h2>3. What you can post</h2>
      <ul>
        <li>Specific physical items you (or someone in your household) genuinely need.</li>
        <li>Honest descriptions. Don't exaggerate or invent a situation.</li>
        <li>A wishlist link, if you have one, that points to a real store page.</li>
      </ul>
      <p>You may not post:</p>
      <ul>
        <li>Requests for cash, gift cards, rent, bills, or anything that isn't a physical item.</li>
        <li>Your home address, or anyone else's, anywhere on the site.</li>
        <li>Anything illegal, dangerous, hateful, sexual, or targeting a specific person.</li>
        <li>Spam, duplicate posts, or posts on behalf of a business.</li>
      </ul>

      <h2>4. How you treat people</h2>
      <p>
        Be kind and be honest. Don't harass, pressure, or scam anyone. Don't ask for personal information beyond
        what's needed to hand off an item in a public place. If someone says no, that's the end of it.
      </p>

      <h2>5. Safety is on you too</h2>
      <p>
        Read our <a href="/safety">safety tips</a> and use your judgment. Meet in public. Never share your address.
        2fish can't vet every person, and we're not responsible for what happens at a handoff. If anyone is in
        danger, call 911.
      </p>

      <h2>6. Your content</h2>
      <p>
        You own what you post. You give us permission to show it on 2fish so the service works. We can remove
        anything that breaks these rules. You can delete your posts, and your whole account, at any time.
      </p>

      <h2>7. Suspension and bans</h2>
      <p>
        We can remove content or suspend accounts that break these terms, with or without warning, especially where
        safety is involved. If you think we got it wrong, email us.
      </p>

      <h2>8. No warranties, limited liability</h2>
      <p>
        2fish is provided as-is. We work hard to keep it running and safe, but we can't promise it will always be
        available or error-free. To the extent the law allows, we're not liable for losses that come from using the
        site or from interactions with other users.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms. If the changes matter, we'll tell you in the app or by email. Continuing to use
        2fish after that means you accept the new version.
      </p>

      <h2>10. Contact</h2>
      <p>
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </ProsePage>
  );
}
