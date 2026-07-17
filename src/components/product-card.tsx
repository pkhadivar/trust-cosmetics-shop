"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { addToCart, type CartProduct } from "@/store/cartSlice";
import { selectSavedProductIds, toggleWishlistItem } from "@/store/wishlistSlice";
import type { RootState } from "@/store/store";
import { calculateDiscount } from "@/utils/math"; 
import { toggleWishlistAction } from "@/actions/wishlist";

export function ProductCard({ product }: { product: CartProduct & { tags?: string[] } }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  
  // خواندن لیست آیدی‌های لایک شده از استور سراسری
  const savedProductIds = useSelector((state: RootState) => selectSavedProductIds(state));
  const isSaved = savedProductIds.includes(product.id);
  
  const [isPending, setIsPending] = useState(false);

  const discountPercent = product.discountedPrice 
    ? calculateDiscount(product.price, product.discountedPrice) 
    : 0;

  function handleAddToCart() {
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
      toast.success("به سبد خرید اضافه شد!");
  }

  // ----------------------------------------------------
  // هندلر لایک (متصل به Redux)
  // ----------------------------------------------------
  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // جلوگیری از کلیک شدن تصادفی روی لینک محصول
    
    const userId = (session?.user as any)?.id;
    if (!userId) {
      toast.error("برای ذخیره محصول ابتدا وارد حساب کاربری شوید.");
      return;
    }

    setIsPending(true);
    // آپدیت آنی (Optimistic) در کل سایت از طریق Redux
    dispatch(toggleWishlistItem(product.id));

    const result = await toggleWishlistAction(product.id, userId);
    
    if (result.success) {
      toast.success(isSaved ? "از لیست علاقه‌مندی‌ها حذف شد" : "به لیست علاقه‌مندی‌ها اضافه شد");
    } else {
      // اگر سرور خطا داد، لایک را در استور برمی‌گردانیم
      dispatch(toggleWishlistItem(product.id));
      toast.error(result.error || "خطایی رخ داد");
    }
    setIsPending(false);
  };

  const displayImage = product.images?.[0] || "/placeholder.jpg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_50px_-15px_rgba(212,175,55,0.45)]">
      
      {/* ------------------------------------------------- */}
      {/* دکمه قلب ظریف در گوشه چپ */}
      {/* ------------------------------------------------- */}
      <div className="absolute start-4 top-4 z-20">
        <button 
          onClick={handleToggleSave}
          disabled={isPending}
          className="flex size-8 items-center justify-center rounded-full bg-background/60 backdrop-blur-md border border-border/50 shadow-sm transition-all hover:bg-background hover:scale-110 disabled:opacity-50"
          aria-label="ذخیره محصول"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Heart className={`size-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
          )}
        </button>
      </div>

      {/* بخش نمایش برچسب‌ها (سمت راست) */}
      <div className="pointer-events-none absolute end-4 top-4 z-10 flex flex-wrap justify-end gap-1.5 max-w-[75%]">
        {discountPercent > 0 && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
            {discountPercent}% تخفیف
          </span>
        )}
        
        {product.tags && product.tags.length > 0 ? (
          product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
              {tag}
            </span>
          ))
        ) : product.badge ? (
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
            {product.badge}
          </span>
        ) : null}
      </div>

      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={displayImage}
          alt={product.title}
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.id}`} className="inline-block w-fit transition-colors hover:text-gold">
          <h3 className="text-base font-semibold line-clamp-1">{product.title}</h3>
        </Link>
        
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground min-h-[40px] line-clamp-2">
          {product.subtitle || ""}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
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
          >
            <Plus className="size-4" />
            افزودن
          </button>
        </div>
      </div>
    </div>
  );
}