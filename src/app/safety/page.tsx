import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose-page";

export const metadata: Metadata = {
  title: "Safety tips",
  description: "How to give and receive safely on 2fish: public meeting spots, what never to share, and how to report.",
};

export default function SafetyPage() {
  return (
    <ProsePage eyebrow="Safety" title="Give and receive with your guard up." intro="Most handoffs are quick and kind. These habits keep it that way.">
      <h2>Meeting up</h2>
      <ul>
        <li>
          <strong>Always meet in a public place.</strong> A library lobby, a grocery store entrance, a coffee shop, a
          church office during business hours. Many police stations have designated exchange spots too.
        </li>
        <li>
          <strong>Daylight is best.</strong> If it has to be evening, pick somewhere busy and well lit.
        </li>
        <li>
          <strong>Bring someone if you can.</strong> A friend, a partner, or a family member. Tell someone where
          you're going either way.
        </li>
        <li>
          <strong>Keep it quick.</strong> Hand off the item, say thanks, and go. You don't owe anyone a longer
          conversation.
        </li>
        <li>
          <strong>Prefer the wishlist when in doubt.</strong> If a post has a wishlist, buying from it means nobody
          has to meet at all.
        </li>
      </ul>

      <h2>What never to share</h2>
      <ul>
        <li>Your home address, or anyone else's. 2fish blocks posts that look like a street address, but be careful in messages too.</li>
        <li>Your daily routine, workplace, or your kids' school.</li>
        <li>Bank details, gift card numbers, or any payment info. Nobody on 2fish should ever ask you for money.</li>
        <li>Photos of ID, documents, or your home's exterior.</li>
      </ul>

      <h2>Red flags</h2>
      <ul>
        <li>Pressure to meet at a home, or to meet right now.</li>
        <li>Someone asking you to send cash, a gift card, or a “deposit” instead of the item.</li>
        <li>A helper who wants your address “to make it easier.”</li>
        <li>Anyone who gets angry when you say no. You can always say no.</li>
      </ul>

      <h2>If something feels off</h2>
      <p>
        Trust that feeling. Stop the conversation, use the <strong>Block</strong> button so they can't contact you,
        and tap <strong>Report</strong> on the post, profile, or message. A person reviews every report.
      </p>
      <p>
        If you or someone else is in immediate danger, call <strong>911</strong> first.
      </p>

      <h2>For helpers</h2>
      <ul>
        <li>Don't ask for a thank-you, a photo, or personal details. The person has already told you what they need.</li>
        <li>If you can't follow through, cancel your offer in the app so the need reopens for someone else.</li>
        <li>Respect what was asked for. The right size matters more than extra stuff.</li>
      </ul>
    </ProsePage>
  );
}
