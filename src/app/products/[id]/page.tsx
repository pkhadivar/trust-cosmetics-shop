import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // مسیر تنظیمات NextAuth خود را چک کنید
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartAction } from "@/components/add-to-cart-action";
import { ProductTabs } from "@/components/product-tabs";
import { WishlistShareButtons } from "@/components/wishlist-share-buttons";
import { ShieldCheck, Truck, Sparkles, CheckCircle2, Ban } from "lucide-react";

// 🌟 ایمپورت تابع هلپر برای مدیریت ویدیوها
import { getMediaUrl } from "@/utils/media";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // بررسی سشن کاربر برای تشخیص لایک بودن محصول
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      attributes: true,
      faqs: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
      // اگر کاربر لاگین بود، چک کن آیا آیدی او در لیست لایک‌کنندگان این محصول هست یا نه
      savedByUsers: userId ? { where: { id: userId } } : false,
    },
  });

  if (!product) notFound();

  // بررسی وضعیت لایک اولیه
  const initialIsSaved =
    product.savedByUsers && product.savedByUsers.length > 0;

  // بررسی وضعیت موجودی محصول
  const isOutOfStock = product.isAvailable === false;

  const activePrice = product.discountedPrice ?? product.price;

  const bulletPoints = product.description
    ? product.description.split("\n").filter((line) => line.trim().length > 0)
    : [];

  // 🌟 تبدیل لیست ویدیوها به لینک کامل برای نمایش در تب‌ها
  const fullVideoUrls = product.videoUrls?.map((vid) => getMediaUrl(vid)) || [];

  const cleanProductForCart = {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    discountedPrice: product.discountedPrice,
    // 🌟 نکته مهم: اینجا همان کلیدهای خام را به سبد خرید می‌فرستیم،
    // چون کامپوننت ProductCard خودش با getMediaUrl آنها را رندر می‌کند.
    images: product.images,
    badge: product.tags?.[0]?.name || null,
    tags: product.tags?.map((t) => t.name) || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div
            className={`w-full transition-opacity duration-300 ${isOutOfStock ? "opacity-75" : ""}`}
          >
            {/* 🌟 عکس‌ها را خام به گالری می‌دهیم، گالری در فایل بالا خودش همه را کامل می‌کند */}
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                  {product.category.name}
                </span>

                {product.tags &&
                  product.tags.length > 0 &&
                  product.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs font-medium text-[#0a0f1c] bg-gold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="size-3" />
                      {tag.name}
                    </span>
                  ))}
              </div>

              {/* دکمه‌های لایک و اشتراک‌گذاری */}
              <WishlistShareButtons
                productId={product.id}
                productTitle={product.title}
                initialIsSaved={initialIsSaved}
              />
            </div>

            <h1
              className={`mt-5 text-3xl font-bold leading-tight sm:text-4xl ${isOutOfStock ? "text-muted-foreground" : "text-foreground"}`}
            >
              {product.title}
            </h1>

            {product.subtitle && (
              <p className="mt-3 text-base text-muted-foreground font-medium">
                {product.subtitle}
              </p>
            )}

            <div className="mt-6 h-px w-full bg-border/40" />

            {bulletPoints.length > 0 && (
              <ul className="mt-6 space-y-3">
                {bulletPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed"
                  >
                    <CheckCircle2
                      className={`size-4 shrink-0 mt-0.5 opacity-80 ${isOutOfStock ? "text-muted-foreground" : "text-gold"}`}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                قیمت مصرف‌کننده:
              </span>
              <div className="flex items-baseline gap-3">
                {product.discountedPrice && !isOutOfStock && (
                  <span className="text-sm text-muted-foreground line-through decoration-destructive/60">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span
                  className={`text-3xl font-black ${isOutOfStock ? "text-muted-foreground" : "text-gold"}`}
                >
                  {formatPrice(activePrice)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {isOutOfStock ? (
                <div className="w-full py-4 rounded-xl bg-secondary/50 text-muted-foreground font-bold text-lg border border-border cursor-not-allowed flex items-center justify-center gap-2">
                  <Ban className="size-5" />
                  این محصول در حال حاضر ناموجود است
                </div>
              ) : (
                <AddToCartAction product={cleanProductForCart as any} />
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck
                  className={`size-5 shrink-0 ${isOutOfStock ? "text-muted-foreground" : "text-gold"}`}
                />
                <span>تضمین اصالت کالا — خرید اورجینال</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Truck
                  className={`size-5 shrink-0 ${isOutOfStock ? "text-muted-foreground" : "text-gold"}`}
                />
                <span>ارسال رایگان برای سفارش‌های بالای ۴ میلیون</span>
              </div>
            </div>
          </div>
        </div>

        <ProductTabs
          productId={product.id}
          description={product.richDescription}
          attributes={product.attributes}
          faqs={product.faqs}
          // 🌟 ارسال لینک‌های ویدیو که کاملاً تصحیح شده‌اند
          videoUrls={fullVideoUrls}
          reviews={product.reviews}
        />
      </main>
    </div>
  );
}
