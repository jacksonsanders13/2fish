import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn, type Dir } from "@/lib/utils";

export function SiteHeader({ dir, tone = "light" }: { dir: Dir; tone?: "light" | "navy" }) {
  const navy = tone === "navy";
  return (
    <header
      className={cn(
        "border-b",
        navy ? "on-navy border-on-navy-line bg-navy text-white" : "border-line bg-white text-ink",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={`/${dir}`} className="rounded-ctl">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          <a href="#how" className={cn("hover:underline", navy ? "text-white/85" : "text-muted hover:text-ink")}>
            How it works
          </a>
          <a href="#cost" className={cn("hover:underline", navy ? "text-white/85" : "text-muted hover:text-ink")}>
            What a missed call costs
          </a>
          <Link
            href={`/${dir}/dashboard`}
            className={cn("hover:underline", navy ? "text-white/85" : "text-muted hover:text-ink")}
          >
            Sign in
          </Link>
        </nav>
        <Button href={`/${dir}/audit`} size="sm" variant={navy ? "inverse" : "primary"}>
          Start your free audit
        </Button>
      </Container>
    </header>
  );
}
