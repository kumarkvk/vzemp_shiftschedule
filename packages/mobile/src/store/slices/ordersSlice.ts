import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Order } from '@/types';

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
}

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.items = action.payload;
    },
    addOrder(state, action: PayloadAction<Order>) {
      state.items = [action.payload, ...state.items];
    },
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selectedOrder = action.payload;
    },
  },
});

export const { setOrders, addOrder, setSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
