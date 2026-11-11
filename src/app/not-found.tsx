import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center">
        <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-80" />
        <Container size="sm" className="relative py-24 text-center">
          <LogoMark size={40} className="mx-auto text-brand" />
          <p className="mt-6 font-mono text-sm text-muted-foreground">404</p>
          <h1 className="text-display mt-2 text-4xl font-semibold sm:text-5xl">That page swam off.</h1>
          <p className="mt-4 text-muted-foreground">
            The link may be old, or the post may have been fulfilled and taken down. Either way, there's more to see
            on the board.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/needs" />}>
              Browse needs
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/" />}>
              Go home
            </Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
