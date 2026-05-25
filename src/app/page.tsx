import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhyItMatters } from "@/components/sections/WhyItMatters";
import { WhatYouReceive } from "@/components/sections/WhatYouReceive";
import { Process } from "@/components/sections/Process";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
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
