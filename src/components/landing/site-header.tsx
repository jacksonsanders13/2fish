import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "night" }) {
  const night = tone === "night";
  const link = cn("text-sm hover:underline", night ? "text-white/85" : "text-ink");
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b",
        night ? "on-night border-on-night-line bg-night text-white" : "border-line bg-white text-ink",
      )}
    >
      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <a href="#cost" className={link}>
            What a missed call costs
          </a>
          <a href="#how" className={link}>
            How it works
          </a>
          <a href="#pricing" className={link}>
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className={night ? "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" : undefined}
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="signal">
            <Link href="/audit">
              <span className="sm:hidden">Free audit</span>
              <span className="hidden sm:inline">Start your free audit</span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
