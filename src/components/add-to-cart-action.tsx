"use client";

import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeFromCart, selectCartItems, type CartProduct } from "@/store/cartSlice";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { RootState } from "@/store/store";

export function AddToCartAction({ product }: { product: CartProduct }) {
  const dispatch = useDispatch();
  
  // خواندن کل سبد خرید از ریداکس
  const cartItems = useSelector((state: RootState) => selectCartItems(state));
  
  // بررسی اینکه آیا این محصول خاص در سبد خرید وجود دارد یا خیر؟
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;
  
  // اگر در سبد بود تعدادِ واقعیِ ریداکس را نشان بده، در غیر این صورت روی 1 باش
  const quantity = cartItem?.quantity || 1; 

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  const handleIncrement = () => {
    if (isInCart) {
      // اگر در سبد بود، یکی به آن اضافه کن
      dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }));
    } else {
      // اگر هنوز در سبد نیست و کاربر روی + کلیک کرد، محصول را با تعداد ۲ به سبد اضافه کن
      dispatch(addToCart({ product, quantity: 2 }));
    }
  };

  const handleDecrement = () => {
    if (isInCart) {
      if (quantity > 1) {
        // کم کردن تعداد
        dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }));
      } else {
        // اگر تعداد 1 بود و کاربر روی منفی کلیک کرد، محصول کاملاً از سبد حذف شود
        dispatch(removeFromCart(product.id));
      }
    }
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
      {/* باکس انتخاب تعداد (کاملاً متصل به ریداکس) */}
      <div 
        className={`flex h-12 w-full sm:w-32 items-center justify-between rounded-xl border px-3 transition-colors ${
          isInCart ? "border-gold bg-gold/10" : "border-border bg-secondary/40"
        }`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!isInCart} // اگر در سبد نیست دکمه منفی غیرفعال باشد
          className={`p-1.5 transition-colors ${
            isInCart ? "text-foreground hover:text-red-500" : "text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          {isInCart && quantity === 1 ? <Trash2 className="size-4 text-red-500" /> : <Minus className="size-4" />}
        </button>
        
        <span className="text-sm font-bold w-6 text-center">
          {quantity.toLocaleString("fa-IR")}
        </span>
        
        <button
          type="button"
          onClick={handleIncrement}
          className="p-1.5 text-foreground hover:text-gold transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* دکمه افزودن (تغییر وضعیت هوشمند) */}
      <button 
        onClick={handleAddToCart}
        disabled={isInCart}
        className={`flex flex-1 h-12 w-full items-center justify-center gap-2 font-bold rounded-xl transition-all ${
          isInCart 
            ? "bg-secondary text-muted-foreground cursor-default border border-border" // حالت استاتیک وقتی محصول در سبد است
            : "bg-gold hover:bg-yellow-500 text-[#0a0f1c] shadow-[0_4px_20px_-5px_rgba(212,175,55,0.4)]" // حالت اکتیو
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