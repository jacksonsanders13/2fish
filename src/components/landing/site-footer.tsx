import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import type { Dir } from "@/lib/format";

export function SiteFooter({ dir }: { dir: Dir }) {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <Link href={`/${dir}`} className="inline-block rounded-md">
            <Logo />
          </Link>
          <p className="mt-3 text-sm">Made in Raleigh, NC.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <a href="#how" className="hover:underline">
              How it works
            </a>
          </li>
          <li>
            <Link href={`/${dir}/audit`} className="hover:underline">
              Free audit
            </Link>
          </li>
          <li className="text-muted-foreground">
            <span title="Placeholder. Pages come in a later phase.">Privacy</span>
          </li>
          <li className="text-muted-foreground">
            <span title="Placeholder. Pages come in a later phase.">Terms</span>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
