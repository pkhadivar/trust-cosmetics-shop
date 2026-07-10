// فایل: src/components/product-showcase.tsx
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export async function ProductShowcase() {
  // ۱. دریافت ۶ محصول آخر از دیتابیس واقعی به جای فایل mock
  const realProducts = await prisma.product.findMany({
    where: { 
      isAvailable: true 
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    take: 6 
  });

  return (
    <section
      id="products"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="text-center">
        <span className="text-sm font-medium text-gold">کلکسیون ویژه</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
          محصولات منتخب تراست
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          مجموعه‌ای از پرفروش‌ترین محصولات لاکچری ما، انتخاب‌شده برای نتایجی
          چشمگیر و ماندگار.
        </p>
        <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {realProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-border">
            در حال حاضر محصولی در فروشگاه موجود نیست.
          </div>
        ) : (
          realProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}