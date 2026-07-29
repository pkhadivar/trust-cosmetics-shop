"use client";

import { useState } from "react";
import { Heart, Share2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { toggleWishlistItem } from "@/store/wishlistSlice";
import { toggleWishlistAction } from "@/actions/wishlist";

interface Props {
  productId: string;
  productTitle: string;
  initialIsSaved?: boolean; // 🌟 این فیلد اضافه شد تا دیتای سرور را بگیرد
}

export function WishlistShareButtons({ productId, productTitle, initialIsSaved = false }: Props) {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  
  // 🌟 استفاده از استیت لوکال برای رندر سریع و بدون پرش (گرفته شده از سرور)
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, setIsPending] = useState(false);

  const handleToggleSave = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      toast.error("برای ذخیره محصول ابتدا وارد حساب کاربری شوید.");
      return;
    }

    setIsPending(true);
    const newSavedState = !isSaved;
    
    // آپدیت آنی رابط کاربری (Optimistic UI)
    setIsSaved(newSavedState); 
    dispatch(toggleWishlistItem(productId)); // ارسال به ریداکس برای آپدیت بقیه بخش‌ها

    const result = await toggleWishlistAction(productId, userId);
    
    if (result.success) {
      toast.success(newSavedState ? "به لیست علاقه‌مندی‌ها اضافه شد" : "از لیست حذف شد");
    } else {
      // بازگردانی تغییرات در صورت خطای سرور
      setIsSaved(!newSavedState);
      dispatch(toggleWishlistItem(productId)); 
      toast.error(result.error || "خطایی رخ داد");
    }
    setIsPending(false);
  };

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/products/${productId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `محصول ${productTitle} را در فروشگاه تراست ببینید!`,
          url: productUrl,
        });
      } catch (error) {
        // انصراف کاربر
      }
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success("لینک محصول در کلیپ‌بورد کپی شد!");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleSave}
        disabled={isPending}
        className="flex size-11 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 transition-all hover:bg-secondary hover:border-border disabled:opacity-50"
        title="ذخیره محصول"
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Heart className={`size-5 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
        )}
      </button>

      <button
        onClick={handleShare}
        className="flex size-11 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 transition-all hover:bg-secondary hover:border-border"
        title="اشتراک‌گذاری"
      >
        <Share2 className="size-5 text-muted-foreground hover:text-blue-500" />
      </button>
    </div>
  );
}