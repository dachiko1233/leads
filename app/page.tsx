import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhyAgencies } from "@/components/WhyAgencies";
import { PricingSlider } from "@/components/PricingSlider";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyAgencies />
        <PricingSlider />
      </main>
      <Footer />
    </>
  );
}
