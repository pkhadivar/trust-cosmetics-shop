"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { CartDrawer } from "@/components/cart-drawer";
import { store } from "@/store/store";
import { setWishlist } from "@/store/wishlistSlice";

// کامپوننت کمکی برای دریافت اطلاعات اولیه کاربر از دیتابیس و تزریق به Redux
function StateInitializer() {
  const dispatch = useDispatch();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/wishlist")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => {
          // استخراج فقط آیدی محصولات از آرایه دیتابیس
          const productIds = data.map((item: any) => item.id);
          dispatch(setWishlist(productIds));
        })
        .catch((err) => console.error("Error fetching initial wishlist:", err));
    } else if (status === "unauthenticated") {
      // در صورت خروج از حساب، لیست خالی شود
      dispatch(setWishlist([]));
    }
  }, [status, dispatch]);

  return null; // این کامپوننت فقط منطق دارد و چیزی رندر نمی‌کند
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* StateInitializer درون Provider قرار می‌گیرد تا بتواند از useDispatch استفاده کند */}
      <StateInitializer />
      {children}
      <CartDrawer />
    </Provider>
  );
}