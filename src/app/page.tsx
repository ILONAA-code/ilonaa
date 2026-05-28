import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { homeMetadata } from "@/lib/site/metadata";
import { Footer } from "@/components/layout/Footer";
import { LandingPageTracker } from "@/components/analytics/LandingPageTracker";
import { Hero } from "@/components/sections/Hero";
import { WhyItMatters } from "@/components/sections/WhyItMatters";
import { WhatYouReceive } from "@/components/sections/WhatYouReceive";
import { Process } from "@/components/sections/Process";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { WhyFeelsDifferent } from "@/components/sections/WhyFeelsDifferent";

export const metadata: Metadata = homeMetadata;

export default function Home() {
  return (
    <>
      <LandingPageTracker />
      <Navbar />
      <main id="main-content">
        <Hero />
        <WhyItMatters />
        <WhatYouReceive />
        <Process />
        <WhyFeelsDifferent />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
