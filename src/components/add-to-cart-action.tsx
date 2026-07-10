"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeFromCart, selectCartItems, type CartProduct } from "@/store/cartSlice";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { RootState } from "@/store/store";

export function AddToCartAction({ product }: { product: CartProduct }) {
  const dispatch = useDispatch();
  
  // حافظه محلی برای زمانی که محصول هنوز وارد سبد خرید نشده است
  const [localQuantity, setLocalQuantity] = useState(1);
  
  // خواندن وضعیت سبد خرید از ریداکس
  const cartItems = useSelector((state: RootState) => selectCartItems(state));
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;
  
  // اگر محصول در سبد بود، تعداد واقعی آن در سبد را نشان بده، وگرنه تعدادِ محلیِ انتخاب شده را نشان بده
  const displayQuantity = isInCart ? cartItem.quantity : localQuantity; 

  const handleAddToCart = () => {
    if (!isInCart) {
      // ارسال محصول به سبد خرید با تعدادی که کاربر انتخاب کرده است
      dispatch(addToCart({ product, quantity: localQuantity }));
    }
  };

  const handleIncrement = () => {
    if (isInCart) {
      // اگر در سبد بود، آپدیت ریداکس
      dispatch(updateQuantity({ productId: product.id, quantity: displayQuantity + 1 }));
    } else {
      // اگر در سبد نبود، فقط عدد محلی روی صفحه را زیاد کن
      setLocalQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (isInCart) {
      if (displayQuantity > 1) {
        // کم کردن از ریداکس
        dispatch(updateQuantity({ productId: product.id, quantity: displayQuantity - 1 }));
      } else {
        // حذف کامل از ریداکس و ریست کردن عدد محلی
        dispatch(removeFromCart(product.id));
        setLocalQuantity(1); 
      }
    } else {
      // اگر در سبد نبود، فقط عدد محلی را کم کن (کمتر از ۱ نشود)
      setLocalQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
      {/* باکس انتخاب تعداد */}
      <div 
        className={`flex h-12 w-full sm:w-32 items-center justify-between rounded-xl border px-3 transition-colors ${
          isInCart ? "border-gold bg-gold/10" : "border-border bg-secondary/40"
        }`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!isInCart && localQuantity === 1} // غیرفعال کردن دکمه منفی وقتی در سبد نیست و عدد 1 است
          className={`p-1.5 transition-colors ${
            isInCart && displayQuantity === 1 
              ? "text-red-500 hover:text-red-600" // حالت سطل زباله
              : localQuantity === 1 && !isInCart
                ? "text-muted-foreground/40 cursor-not-allowed" // حالت غیرفعال
                : "text-foreground hover:text-gold" // حالت عادی
          }`}
        >
          {isInCart && displayQuantity === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
        </button>
        
        <span className="text-sm font-bold w-6 text-center">
          {displayQuantity.toLocaleString("fa-IR")}
        </span>
        
        <button
          type="button"
          onClick={handleIncrement}
          className="p-1.5 text-foreground hover:text-gold transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* دکمه افزودن */}
      <button 
        onClick={handleAddToCart}
        disabled={isInCart}
        className={`flex flex-1 h-12 w-full items-center justify-center gap-2 font-bold rounded-xl transition-all ${
          isInCart 
            ? "bg-secondary text-muted-foreground cursor-default border border-border" 
            : "bg-gold hover:bg-yellow-500 text-[#0a0f1c] shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)]" 
        }`}
      >
        {isInCart ? (
          <>موجود در سبد خرید</>
        ) : (
          <>
            <ShoppingCart className="size-5" />
            افزودن به سبد خرید
          </>
        )}
      </button>
    </div>
  );
}