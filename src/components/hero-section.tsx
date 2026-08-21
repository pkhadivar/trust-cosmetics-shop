import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function HeroSection() {
  // ۱. دریافت تعداد واقعی محصولات موجود از دیتابیس
  const productCount = await prisma.product.count({
    where: { isAvailable: true },
  });

  // ۲. دریافت محصول ویژه برای هدر (با استفاده از فیلد isFeatured)
  const heroProduct = await prisma.product.findFirst({
    where: {
      isFeatured: true,
      isAvailable: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // مدیریت ایمن آرایه تصاویر (برای جلوگیری از خطای TypeScript در فیلدهای JSON پریزما)
  const images = heroProduct?.images as string[] | undefined;
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
  const rawImage = images?.[0];

  const fullImageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${baseUrl}/${rawImage}`
    : "https://placehold.co/600x800/1A2235/D4AF37/png?text=Trust+Product";
  // مقادیر Fallback به همراه اضافه شدن فیلد discountedPrice
  const displayProduct = {
    id: heroProduct?.id || "fallback-id",
    title: heroProduct?.title || "کرم خاویار تراست اسمارت",
    price: heroProduct?.price || 7470000,
    discountedPrice: heroProduct?.discountedPrice || null,
    imageUrl: fullImageUrl,
  };

  // محاسبه درصد تخفیف (در صورت وجود)
  const discountPercent = displayProduct.discountedPrice
    ? Math.round(
        ((displayProduct.price - displayProduct.discountedPrice) /
          displayProduct.price) *
          100,
      )
    : 0;

  return (
    <section className="relative overflow-hidden bg-[#0B1120] py-16 lg:py-24">
      {/* افکت‌های نوری پس‌زمینه */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-8">
          {/* بخش راست: متون و دکمه‌ها */}
          <div className="w-full lg:w-1/2 flex flex-col text-right">
            <div className="inline-flex items-center gap-2 self-end lg:self-start rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 mb-8">
              <Star className="size-4 text-gold fill-gold" />
              <span className="text-sm font-medium text-gold">
                مجموعه لاکچری ۱۴۰۵
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              زیبایی ماندگار با <br />
              <span className="text-gold">مراقبت تخصصی پوست</span>
            </h1>

            <p className="text-muted-foreground/80 text-lg leading-relaxed mb-10 max-w-lg lg:ml-auto">
              ترکیبی از علم و طبیعت؛ محصولات تراست با فرمولاسیون اختصاصی و
              تاییدیه پزشکان متخصص، درخششی بی‌نظیر به پوست و موی شما هدیه
              می‌دهند.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-16 justify-end lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-gold hover:bg-gold-soft text-[#0B1120] px-8 py-4 font-bold transition-colors"
              >
                مشاهده محصولات
                <ArrowLeft className="size-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-border hover:border-gold/50 bg-card/50 hover:bg-card px-8 py-4 font-medium text-white transition-all"
              >
                داستان برند
              </Link>
            </div>

            {/* آمار */}
            <div className="grid grid-cols-3 gap-6 border-t border-border/50 pt-8 mt-auto">
              <div>
                <div className="text-3xl font-bold text-gold mb-1">
                  +{productCount.toLocaleString("fa-IR")}
                </div>
                <div className="text-sm text-muted-foreground">محصول تخصصی</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-1">+۹۸٪</div>
                <div className="text-sm text-muted-foreground">
                  رضایت مشتریان
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-1">+۷</div>
                <div className="text-sm rounded border border-border/50 bg-card/30 px-2 py-0.5 inline-block text-muted-foreground">
                  سال تجربه
                </div>
              </div>
            </div>
          </div>

          {/* بخش چپ: تصویر محصول */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <Link
              href={`/products/${displayProduct.id}`}
              className="group/hero-img block relative w-full max-w-md aspect-[4/5]"
            >
              {/* بج درصد تخفیف */}
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 z-30 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white shadow-[0_2px_15px_rgba(16,185,129,0.4)]">
                  {discountPercent}٪ تخفیف
                </div>
              )}

              <div className="absolute inset-0 bg-[#050810] rounded-3xl shadow-2xl overflow-hidden opacity-90 group-hover/hero-img:opacity-100 transition-all duration-500 flex items-center justify-center p-6 sm:p-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gold/10 rounded-full blur-[60px] pointer-events-none z-0" />

                <Image
                  src={displayProduct.imageUrl}
                  alt={displayProduct.title}
                  fill
                  className="object-contain object-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] z-10 transition-transform duration-700 group-hover/hero-img:scale-105"
                  quality={100}
                  unoptimized={true}
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 pointer-events-none" />
              </div>

              {/* باکس شناور قیمت و عنوان */}
              <div className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-12 bg-[#1A2235]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl flex items-center gap-4 transition-transform group-hover/hero-img:-translate-y-2 z-20">
                <div className="flex flex-col text-right gap-1">
                  <span className="text-white font-bold text-lg transition-colors group-hover/hero-img:text-gold">
                    {displayProduct.title}
                  </span>

                  <div className="flex flex-col gap-0.5">
                    {displayProduct.discountedPrice && (
                      <span className="text-[13px] font-medium text-white/50 line-through decoration-red-500/80 decoration-2 w-fit">
                        {Number(displayProduct.price).toLocaleString("fa-IR")}
                      </span>
                    )}
                    <span className="text-gold font-bold text-[15px]">
                      {Number(
                        displayProduct.discountedPrice || displayProduct.price,
                      ).toLocaleString("fa-IR")}{" "}
                      تومان
                    </span>
                  </div>
                </div>
                <div className="size-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 self-end">
                  <Star className="size-6 text-gold fill-gold" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
