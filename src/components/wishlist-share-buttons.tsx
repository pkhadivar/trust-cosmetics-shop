"use client";

import { useState } from "react";
import { Heart, Share2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { selectSavedProductIds, toggleWishlistItem } from "@/store/wishlistSlice";
import type { RootState } from "@/store/store";
import { toggleWishlistAction } from "@/actions/wishlist";

interface Props {
  productId: string;
  productTitle: string;
}

// نکته: نیازی به پاس دادن initialIsSaved از سرور نیست چون ریداکس مدیریت می‌کند
export function WishlistShareButtons({ productId, productTitle }: Props) {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  
  const savedProductIds = useSelector((state: RootState) => selectSavedProductIds(state));
  const isSaved = savedProductIds.includes(productId);

  const [isPending, setIsPending] = useState(false);

  const handleToggleSave = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) {
      toast.error("برای ذخیره محصول ابتدا وارد حساب کاربری شوید.");
      return;
    }

    setIsPending(true);
    dispatch(toggleWishlistItem(productId)); // آپدیت آنی

    const result = await toggleWishlistAction(productId, userId);
    
    if (result.success) {
      toast.success(isSaved ? "از لیست حذف شد" : "به لیست علاقه‌مندی‌ها اضافه شد");
    } else {
      dispatch(toggleWishlistItem(productId)); // بازگردانی در صورت خطا
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
        // کاربر انصراف داده است
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