import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  const link = "text-sm text-ink hover:underline";
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white text-ink">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <Link href="/#cost" className={link}>
            What posts bring in
          </Link>
          <Link href="/#how" className={link}>
            How it works
          </Link>
          <Link href="/#pricing" className={link}>
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="signal" className="h-10 sm:h-9">
            <Link href="/#waitlist">Join the waitlist</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
