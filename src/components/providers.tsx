"use client";

import { Provider } from "react-redux";
import { CartDrawer } from "@/components/cart-drawer";
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <CartDrawer />
    </Provider>
  );
}
