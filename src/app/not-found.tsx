import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="max-w-xl py-24">
      <h1 className="text-display font-semibold">That page isn&apos;t here</h1>
      <p className="mt-3">The link may be old or mistyped.</p>
      <Button asChild variant="signal" className="mt-6">
        <Link href="/">Go to the home page</Link>
      </Button>
    </Container>
  );
}
