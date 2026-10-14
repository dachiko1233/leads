import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSlider } from "@/components/PricingSlider";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <PricingSlider />
      </main>
      <Footer />
    </>
  );
}
