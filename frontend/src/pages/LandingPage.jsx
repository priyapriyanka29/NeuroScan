import { SiteHeader } from "../components/landing/SiteHeader";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { Workflow } from "../components/landing/Workflow";
import { Technology } from "../components/landing/Technology";
import { SiteFooter } from "../components/landing/SiteFooter";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <Hero />
        <Features />
        <Workflow />
        <Technology />

        <section
          id="disclaimer"
          aria-label="Clinical disclaimer"
          className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8"
        >
          <ClinicalDisclaimer />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
