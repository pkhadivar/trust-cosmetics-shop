// فایل: src/components/product-showcase.tsx
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export async function ProductShowcase() {
  // ۱. دریافت محصولات منتخب به همراه برچسب‌های (Tags) متصل به آن‌ها
  const featuredProducts = await prisma.product.findMany({
    where: { 
      isAvailable: true,
      isFeatured: true 
    },
    include: {
      tags: true // <--- لود کردن تگ‌ها از دیتابیس
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    take: 6 
  });

  // ۲. تبدیل فرمت دیتای دیتابیس به فرمت تمیز مورد نیاز ProductCard و ریداکس
  // نام اولین تگ محصول به عنوان برچسب (badge) روی کارت قرار می‌گیرد
  const formattedProducts = featuredProducts.map((product) => ({
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    badge: product.tags?.[0]?.name || null, // حفظ برای پشتیبانی از ریداکس
    tags: product.tags.map(t => t.name),    // <--- اضافه شد: پاس دادن تمام تگ‌ها به صورت آرایه
  }));

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
        {formattedProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-border">
            در حال حاضر هیچ محصولی به عنوان محصول منتخب تنظیم نشده است.
          </div>
        ) : (
          formattedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}