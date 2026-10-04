import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Pagination, Product } from '@/types';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  pagination: Pagination;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<{ items: Product[]; pagination: Pagination }>) {
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
    },
    appendProducts(state, action: PayloadAction<{ items: Product[]; pagination: Pagination }>) {
      state.items = [...state.items, ...action.payload.items];
      state.pagination = action.payload.pagination;
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
  },
});

export const { setProducts, appendProducts, setSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
