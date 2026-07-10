// src/app/categories/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{ slug: string[] }>; 
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  
  // ۱. پیدا کردن اسلاگ خام (حتی اگر ساختارِ آرایه‌ای [...slug] باشد)
  const rawSlug = Array.isArray(resolvedParams.slug) 
    ? resolvedParams.slug[resolvedParams.slug.length - 1] 
    : resolvedParams.slug;

  // ۲. ترجمه آدرسِ مرورگر به حروف فارسی واقعی برای جستجو در دیتابیس
  const decodedSlug = decodeURIComponent(rawSlug);

  // ۳. جستجو در دیتابیس
  const category = await prisma.category.findUnique({
    where: { slug: decodedSlug },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!category) {
    notFound();
  }

  const filteredProducts = category.products;

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        
        <div className="text-center">
          <span className="text-sm font-medium text-gold">دسته‌بندی محصولات</span>
          <h1 className="mt-3 text-balance text-3xl font-bold sm:text-4xl text-foreground">
            {category.name}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            {filteredProducts.length > 0
              ? `${filteredProducts.length.toLocaleString("fa-IR")} محصول در این دسته`
              : "در حال حاضر محصولی در این دسته موجود نیست."}
          </p>
          <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="mt-14 rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-muted-foreground">
              به‌زودی محصولات جدید به این دسته اضافه می‌شوند.
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}