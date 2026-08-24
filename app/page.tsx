import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CsvPreview } from "@/components/CsvPreview";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSlider } from "@/components/PricingSlider";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CsvPreview />
        <HowItWorks />
        <PricingSlider />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
