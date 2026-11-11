"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex flex-1 items-center">
      <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-80" />
      <Container size="sm" className="relative py-24 text-center">
        <LogoMark size={40} className="mx-auto text-brand" />
        <h1 className="text-display mt-6 text-4xl font-semibold sm:text-5xl">Something went sideways.</h1>
        <p className="mt-4 text-muted-foreground">
          That's on us, not you. Try again, and if it keeps happening, head back to the board.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">ref {error.digest}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/" />}>
            Go home
          </Button>
        </div>
      </Container>
    </main>
  );
}
