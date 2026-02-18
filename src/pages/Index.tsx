import { Navbar, HeroSection } from "@/components/landing/HeroSection";
import PortalSection from "@/components/landing/PortalSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import { StatsSection, Footer } from "@/components/landing/StatsFooter";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PortalSection />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
