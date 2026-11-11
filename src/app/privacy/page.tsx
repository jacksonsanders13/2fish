import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What 2fish collects, why, and what you can do about it.",
};

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Privacy policy" title="What we collect, and why." intro="Plain English, on purpose. Last updated November 2026.">
      <p className="callout">
        This is a draft written for clarity. It hasn't been reviewed by a lawyer yet. Treat it as our honest
        intentions, and expect wording to change before launch.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>We never collect or store your home address.</li>
        <li>We store your ZIP code as an approximate map point, rounded to about a kilometer.</li>
        <li>We don't sell your data, run ads, or share your information with data brokers.</li>
        <li>You can download everything we have on you, or delete your account, from Settings at any time.</li>
      </ul>

      <h2>What we collect</h2>
      <p>
        <strong>Account information.</strong> Your email address and a password (hashed), or the account identifier
        from Google if you sign in that way. You confirm you're 18 or older when you sign up.
      </p>
      <p>
        <strong>Profile.</strong> A display name, an optional photo, an optional short bio, and a general area (like
        a neighborhood or city) you type in yourself. Your ZIP code is converted to a rounded latitude and longitude;
        we keep the rounded point and the ZIP, nothing more precise.
      </p>
      <p>
        <strong>Needs.</strong> What you post: title, description, category, urgency, optional photo, optional
        wishlist link, and how you'd like to receive help.
      </p>
      <p>
        <strong>Messages.</strong> Messages you send in a thread are stored so both people can read them. If you
        choose to share a meeting spot in a message, that's stored with the message.
      </p>
      <p>
        <strong>Reports and blocks.</strong> If you report or block someone, we keep a record so we can act on it.
      </p>
      <p>
        <strong>Technical logs.</strong> Our hosting providers keep standard server logs (IP address, browser type,
        timestamps) for security and debugging. We don't use third-party advertising or tracking pixels.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To show needs near you and tell neighbors roughly how far away a need is.</li>
        <li>To connect you with a helper or a poster, and deliver messages between you.</li>
        <li>To send notifications you'd expect: someone offered help, you got a message, your password was reset.</li>
        <li>To review reports, enforce our Terms, and keep people safe.</li>
      </ul>

      <h2>Who can see what</h2>
      <p>
        <strong>Public:</strong> open needs (title, description, category, urgency, photo if any, your display
        name, general area, and an approximate distance for whoever is viewing). <strong>Private:</strong> your email,
        your exact ZIP, messages, reports, and blocks. Admins can see reported content in order to review it.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Service providers that run the site for us: Supabase (database, authentication, file storage), Vercel
        (hosting), and Resend (email delivery). Each only gets what it needs to do its job. We'll disclose data if the
        law requires it, or to protect someone's safety.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li><strong>Edit</strong> your profile and needs at any time.</li>
        <li><strong>Download your data</strong> as a JSON file from Settings.</li>
        <li>
          <strong>Delete your account</strong> from Settings. This permanently removes your profile, needs, photos,
          and your side of message threads. The other person's messages are kept but no longer linked to you.
        </li>
        <li><strong>Block</strong> anyone, instantly, from their profile or a message thread.</li>
      </ul>

      <h2>Children</h2>
      <p>2fish is for adults. You must be 18 or older to create an account.</p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </ProsePage>
  );
}
