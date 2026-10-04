import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
};

const computeSubtotal = (items: CartItem[]): number => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.subtotal = computeSubtotal(action.payload);
    },
    clearCartState(state) {
      state.items = [];
      state.subtotal = 0;
    },
  },
});

export const { setCart, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
