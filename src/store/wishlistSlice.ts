import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  savedProductIds: string[];
}

const initialState: WishlistState = {
  savedProductIds: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // مقداردهی اولیه لیست هنگام ورود به سایت
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.savedProductIds = action.payload;
    },
    // تغییر وضعیت یک محصول (اضافه یا حذف) در لحظه کلیک
    toggleWishlistItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.savedProductIds.includes(productId)) {
        state.savedProductIds = state.savedProductIds.filter((id) => id !== productId);
      } else {
        state.savedProductIds.push(productId);
      }
    },
  },
});

export const { setWishlist, toggleWishlistItem } = wishlistSlice.actions;

export const selectSavedProductIds = (state: { wishlist: WishlistState }) =>
  state.wishlist.savedProductIds;

export default wishlistSlice.reducer;