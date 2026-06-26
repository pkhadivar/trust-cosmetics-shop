import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";
import { CategoriesSection } from "@/components/categories-section";
import { ProductShowcase } from "@/components/product-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <CategoriesSection />
        <ProductShowcase />
      </main>
      <SiteFooter />
    </div>
  );
}
