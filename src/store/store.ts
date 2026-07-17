import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/store/cartSlice";
import wishlistReducer from "@/store/wishlistSlice"; // ردیوسر جدید ایمپورت شد

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer, // ردیوسر علاقه‌مندی‌ها اضافه شد
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;