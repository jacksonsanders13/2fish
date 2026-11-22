"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Shown when a page crashes. Plain words, a way to retry, and a way out.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="max-w-xl py-24">
      <h1 className="text-display font-semibold">Something broke on our end</h1>
      <p className="mt-3">Your data is safe. Try again, and if it keeps happening, email hello@join2fish.com{error.digest ? ` with code ${error.digest}` : ""}.</p>
      <div className="mt-6 flex gap-3">
        <Button variant="signal" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </Container>
  );
}
