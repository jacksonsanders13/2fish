import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <Link href="/" className="inline-block rounded-md">
            <Logo />
          </Link>
          <p className="mt-3 text-sm">
            Made in Raleigh, NC. Questions:{" "}
            <a href="mailto:hello@join2fish.com" className="underline underline-offset-2">
              hello@join2fish.com
            </a>
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <Link href="/#how" className="hover:underline">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/#waitlist" className="hover:underline">
              Join the waitlist
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
