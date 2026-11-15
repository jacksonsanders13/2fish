import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "navy" }) {
  const navy = tone === "navy";
  const link = cn("text-sm hover:underline", navy ? "text-white/85" : "text-ink");
  return (
    <header className="on-navy border-b border-on-navy-line bg-navy text-white">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <a href="#how" className={link}>
            How it works
          </a>
          <a href="#cost" className={link}>
            What a missed call costs
          </a>
          <Link href="/dashboard" className={link}>
            Sign in
          </Link>
        </nav>
        <Button asChild size="sm" className={navy ? "bg-white text-navy hover:bg-surface" : undefined}>
          <Link href="/audit">Start your free audit</Link>
        </Button>
      </Container>
    </header>
  );
}
