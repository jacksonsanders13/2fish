import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Account suspended" };

export default function BannedPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center">
        <Container size="sm" className="py-24 text-center">
          <h1 className="text-display text-3xl font-semibold sm:text-4xl">This account is suspended.</h1>
          <p className="mt-4 text-muted-foreground">
            You can still browse, but posting, helping and messaging are turned off. If you think this was a mistake,
            email <a className="font-medium text-foreground underline underline-offset-4" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
