import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ۱. تعریف تایپ یکپارچه و واقعی بر اساس محصولات جدید دیتابیس
export interface CartProduct {
  id: string;
  title: string;
  subtitle: string | null;
  price: number;
  discountedPrice: number | null;
  images: string[];
  badge: string | null;
}

export interface CartItem {
  product: CartProduct; // استفاده از تایپ جدید
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isDrawerOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: CartProduct; quantity?: number }>,
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        existing.quantity += quantity;
        return;
      }

      state.items.push({ product, quantity });
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.product.id !== productId,
        );
        return;
      }

      const item = state.items.find((entry) => entry.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// ۲. محاسبه توتال بر اساس قیمت با تخفیف (در صورت وجود) یا قیمت اصلی
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => {
    const activePrice = item.product.discountedPrice ?? item.product.price;
    return total + activePrice * item.quantity;
  }, 0);

export const selectIsCartDrawerOpen = (state: { cart: CartState }) =>
  state.cart.isDrawerOpen;