import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";
import { CategoriesSection } from "@/components/categories-section";
import { ProductShowcase } from "@/components/product-showcase";
import { BrandShowcase } from "@/components/brand-showcase";

export default async function Page() {
  // دریافت لیست برندها از دیتابیس برای نمایش در لندینگ
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-background">
      {/* هدر و فوتر از اینجا حذف شدند چون در layout.tsx قرار دارند */}
      <HeroSection />
      <FeaturesGrid />
      <CategoriesSection />
      
      {/* نوار نمایش برندها */}
      <BrandShowcase brands={brands} />
      
      <ProductShowcase />
    </div>
  );
}