import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why 2fish exists, where the name comes from, and what we believe about neighborhoods.",
};

export default function AboutPage() {
  return (
    <ProsePage eyebrow="About" title="Two fish, and a crowd that ate." intro="2fish started with a simple observation: most of us would gladly help the family down the street. We just never find out what they need.">
      <h2>The name</h2>
      <p>
        There's an old story about a hillside full of hungry people, and a boy who had only two fish and a few
        small loaves of bread. It wasn't much. He handed it over anyway, and somehow it was enough for everyone,
        with baskets left over.
      </p>
      <p>
        We're not making a theological claim with a website. We just think the story gets something right about how
        neighborhoods actually work. Need is usually specific and small: a box of diapers, a coat in the right size,
        groceries to bridge a week. Generosity is usually small too. The hard part has never been the willingness.
        It's the connection.
      </p>
      <p>
        That's the whole idea. One person says exactly what they need. One neighbor says yes. A little is enough.
      </p>

      <h2>What 2fish is</h2>
      <p>
        A board for specific needs in your neighborhood. People post one item they need and how they'd like to
        receive it. Neighbors nearby either hand it off at a public place or buy it from a wishlist so the store
        ships it directly. No fundraising, no money moving through the site, no fees.
      </p>

      <h2>What it isn't</h2>
      <p>
        It isn't a charity, and it isn't a replacement for the organizations doing serious work on housing, food
        security, and crisis care. It's the thing that happens in between: the neighbor-to-neighbor layer that used
        to run on church bulletin boards and word of mouth.
      </p>
      <p>
        It's also not a place to raise cash. Keeping money off the platform keeps the trust simple. You're giving an
        item, to a person, nearby.
      </p>

      <h2>What we believe</h2>
      <ul>
        <li>
          <strong>Asking shouldn't cost your dignity.</strong> You post what you need, plainly, under a first name.
          Nobody has to tell their whole story.
        </li>
        <li>
          <strong>Privacy is a safety feature.</strong> We never store addresses. Locations are approximate on
          purpose. Handoff details are shared privately, by you.
        </li>
        <li>
          <strong>Everyone is welcome.</strong> The name has roots in a faith story. The door is open to anyone who
          wants to help or needs a hand, whatever they believe.
        </li>
      </ul>

      <h2>Who's behind it</h2>
      <p>
        2fish is built in Raleigh, North Carolina by a student founder, Jackson, and a small circle of friends who
        wanted to see it exist. It's early. If you have ideas, or you'd like to bring 2fish to your church, school, or
        neighborhood, we'd love to hear from you.
      </p>
    </ProsePage>
  );
}
