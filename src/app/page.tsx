import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Faq, Features, FinalCta, Hero, HowItWorks, Origin, PrinciplesStrip } from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrinciplesStrip />
        <Features />
        <HowItWorks />
        <Origin />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
