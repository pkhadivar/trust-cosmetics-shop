import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// 🌟 اضافه شدن ایمپورت سشن
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function ProductShowcase() {
  
  // 🌟 دریافت سشن
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const latestProducts = await prisma.product.findMany({
    where: { 
      isAvailable: true, 
    },
    include: {
      tags: true,
      // 🌟 چک کردن لایک
      savedByUsers: userId ? { where: { id: userId }, select: { id: true } } : false 
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    take: 6 
  });

  const formattedProducts = latestProducts.map((product) => ({
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    badge: product.tags?.[0]?.name || null, 
    tags: product.tags.map(t => t.name),    
    isAvailable: product.isAvailable, 
    // 🌟 پاس دادن لایک به فرمت جدید
    isSaved: userId && product.savedByUsers ? product.savedByUsers.length > 0 : false,
  }));

  return (
    <section
      id="products"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
      dir="rtl"
    >
      <div className="text-center">
        <span className="text-sm font-medium text-gold">کلکسیون ویژه</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl text-foreground">
          جدیدترین محصولات تراست
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          مجموعه‌ای از جدیدترین محصولات لاکچری ما، انتخاب‌شده برای نتایجی
          چشمگیر و ماندگار.
        </p>
        <div className="mx-auto mt-4 h-px w-24 gold-divider" aria-hidden />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formattedProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-border">
            در حال حاضر هیچ محصولی برای نمایش وجود ندارد.
          </div>
        ) : (
          formattedProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))
        )}
      </div>

      {formattedProducts.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/shop"
            className="group flex items-center gap-2 rounded-xl border-2 border-gold px-8 py-3.5 text-sm font-bold text-gold transition-all hover:bg-gold hover:text-[#0a0f1c] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            مشاهده همه محصولات
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  );
}