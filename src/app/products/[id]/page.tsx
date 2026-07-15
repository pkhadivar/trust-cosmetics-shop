import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartAction } from "@/components/add-to-cart-action";
import { ProductTabs } from "@/components/product-tabs"; // <--- ایمپورت کامپوننت تب‌ها
import { ShieldCheck, Truck, Sparkles, CheckCircle2 } from "lucide-react";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // اضافه کردن جداول جدید به کوئری پریزما
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      category: true,
      tags: true,
      attributes: true, // <--- واکشی مشخصات فنی
      faqs: true,       // <--- واکشی سوالات متداول
      reviews: {        // <--- واکشی نظرات (فقط تایید شده‌ها)
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' } // جدیدترین‌ها در ابتدا
      }
    }
  });

  if (!product) notFound();

  const activePrice = product.discountedPrice ?? product.price;

  const bulletPoints = product.description
    ? product.description.split('\n').filter(line => line.trim().length > 0)
    : [];

  const cleanProductForCart = {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    badge: product.tags?.[0]?.name || null, 
    tags: product.tags?.map(t => t.name) || [], 
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* ستون راست: گالری تصاویر */}
          <div className="w-full">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* ستون چپ: اطلاعات کالا */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                {product.category.name}
              </span>
              
              {product.tags && product.tags.length > 0 && product.tags.map((tag) => (
                <span key={tag.id} className="text-xs font-medium text-[#0a0f1c] bg-gold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Sparkles className="size-3" />
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="mt-5 text-3xl font-bold text-foreground leading-tight sm:text-4xl">
              {product.title}
            </h1>
            
            {product.subtitle && (
              <p className="mt-3 text-base text-muted-foreground font-medium">
                {product.subtitle}
              </p>
            )}

            <div className="mt-6 h-px w-full bg-border/40" />

            {/* Bullet Points (ویژگی‌های محصول) */}
            {bulletPoints.length > 0 && (
              <ul className="mt-6 space-y-3">
                {bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="size-4 text-gold shrink-0 mt-0.5 opacity-80" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* قیمت */}
            <div className="mt-8 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">قیمت مصرف‌کننده:</span>
              <div className="flex items-baseline gap-3">
                {product.discountedPrice && (
                  <span className="text-sm text-muted-foreground line-through decoration-destructive/60">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-3xl font-black text-gold">
                  {formatPrice(activePrice)}
                </span>
              </div>
            </div>

            {/* دکمه ادد تو کارت متصل به Redux */}
            <AddToCartAction product={cleanProductForCart as any} />

            {/* مزایای رقابتی */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-5 text-gold shrink-0" />
                <span>تضمین اصالت کالا — خرید اورجینال</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Truck className="size-5 text-gold shrink-0" />
                <span>ارسال رایگان برای سفارش‌های بالای ۴ میلیون</span>
              </div>
            </div>

          </div>
        </div>

        {/* کامپوننت تب‌ها در زیر بخش اصلی */}
        <ProductTabs 
          productId={product.id}
          description={product.richDescription}
          attributes={product.attributes}
          faqs={product.faqs}
          videoUrl={product.videoUrl}
          reviews={product.reviews}
        />

      </main>
    </div>
  );
}