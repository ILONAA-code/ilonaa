import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LandingPageTracker } from "@/components/analytics/LandingPageTracker";
import { Hero } from "@/components/sections/Hero";
import { WhyItMatters } from "@/components/sections/WhyItMatters";
import { WhatYouReceive } from "@/components/sections/WhatYouReceive";
import { Process } from "@/components/sections/Process";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <LandingPageTracker />
      <Navbar />
      <main>
        <Hero />
        <WhyItMatters />
        <WhatYouReceive />
        <Process />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
