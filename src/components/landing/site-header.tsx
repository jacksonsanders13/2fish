import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Dir } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SiteHeader({ dir, tone = "light" }: { dir: Dir; tone?: "light" | "navy" }) {
  const navy = tone === "navy";
  const link = cn("text-sm hover:underline", navy ? "text-white/85" : "text-ink");
  return (
    <header className={cn("border-b", navy ? "on-navy border-on-navy-line bg-navy text-white" : "border-line bg-white")}>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={`/${dir}`} className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <a href="#how" className={link}>
            How it works
          </a>
          <a href="#cost" className={link}>
            What a missed call costs
          </a>
          <Link href={`/${dir}/dashboard`} className={link}>
            Sign in
          </Link>
        </nav>
        <Button asChild size="sm" className={navy ? "bg-white text-navy hover:bg-surface" : undefined}>
          <Link href={`/${dir}/audit`}>Start your free audit</Link>
        </Button>
      </Container>
    </header>
  );
}
