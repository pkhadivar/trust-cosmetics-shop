import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";
import { CategoriesSection } from "@/components/categories-section";
import { ProductShowcase } from "@/components/product-showcase";

export default function Page() {
  return (
    <div className="bg-background">
      {/* هدر و فوتر از اینجا حذف شدند چون در layout.tsx قرار دارند */}
      <HeroSection />
      <FeaturesGrid />
      <CategoriesSection />
      <ProductShowcase />
    </div>
  );
}