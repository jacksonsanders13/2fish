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
          <a href="#cost" className={link}>
            What posts bring in
          </a>
          <a href="#how" className={link}>
            How it works
          </a>
          <a href="#pricing" className={link}>
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="signal">
            <Link href="/audit">
              <span className="sm:hidden">Free grade</span>
              <span className="hidden sm:inline">Grade my store free</span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
