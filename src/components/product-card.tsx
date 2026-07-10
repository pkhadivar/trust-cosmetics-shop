"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart, type CartProduct } from "@/store/cartSlice";
import { calculateDiscount } from "@/utils/math"; 

export function ProductCard({ product }: { product: CartProduct & { tags?: string[] } }) {
  const dispatch = useDispatch();
  
  // محاسبه درصد تخفیف (در صورت وجود discountedPrice)
  const discountPercent = product.discountedPrice 
    ? calculateDiscount(product.price, product.discountedPrice) 
    : 0;

  function handleAddToCart() {
      // ساخت یک آبجکت تمیز فقط با فیلدهای مورد نیاز سبد خرید (حذف تاریخ‌ها)
      const cleanProduct = {
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        price: product.price,
        discountedPrice: product.discountedPrice,
        images: product.images,
        badge: product.badge, 
      };
      
      dispatch(addToCart({ product: cleanProduct, quantity: 1 }));
    }

  // انتخاب اولین عکس آرایه، یا یک عکس پیش‌فرض در صورت خالی بودن دیتابیس
  const displayImage = product.images?.[0] || "/placeholder.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_50px_-15px_rgba(212,175,55,0.45)]">
      
      {/* بخش نمایش برچسب‌ها (نمایش افقی کنار هم) */}
      <div className="pointer-events-none absolute end-4 top-4 z-10 flex flex-wrap justify-end gap-1.5 max-w-[85%]">
        
        {/* برچسب تخفیف */}
        {discountPercent > 0 && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
            {discountPercent}% تخفیف
          </span>
        )}
        
        {/* رندر کردن تمام تگ‌ها */}
        {product.tags && product.tags.length > 0 ? (
          product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
              {tag}
            </span>
          ))
        ) : product.badge ? (
          // در صورتی که تگ‌ها پاس داده نشده باشند اما badge وجود داشته باشد
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
            {product.badge}
          </span>
        ) : null}

      </div>

      {/* بخش تصویر: تبدیل به لینک برای هدایت به صفحه جزئیات */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={displayImage} // هماهنگ شده با فیلد دیتابیس
          alt={product.title} // سئوی بهتر با قرار دادن نام محصول
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* عنوان محصول: تبدیل به لینک */}
        <Link href={`/products/${product.id}`} className="inline-block w-fit transition-colors hover:text-gold">
          <h3 className="text-base font-semibold line-clamp-1">{product.title}</h3>
        </Link>
        
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground min-h-[40px] line-clamp-2">
          {product.subtitle || ""}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {/* نمایش قیمت خط‌خورده در صورت وجود تخفیف */}
            {discountPercent > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price.toLocaleString("fa-IR")}
              </span>
            )}
            
            <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5">
              <span className="text-sm font-bold text-gold">
                {(product.discountedPrice || product.price).toLocaleString("fa-IR")}
              </span>
              <span className="ms-1 text-xs text-gold/80">تومان</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="relative z-10 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-gold hover:text-primary-foreground"
            aria-label={`افزودن ${product.title} به سبد خرید`}
          >
            <Plus className="size-4" />
            افزودن
          </button>
        </div>
      </div>
    </div>
  );
}