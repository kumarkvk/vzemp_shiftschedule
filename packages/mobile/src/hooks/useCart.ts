import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as cartService from '@/services/api/cartService';
import type { RootState } from '@/store';
import { clearCartState, setCart } from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  const refreshCart = useCallback(async () => {
    const response = await cartService.getCart();
    dispatch(setCart(response.items));
    return response;
  }, [dispatch]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const response = await cartService.addToCart({ productId, quantity });
    dispatch(setCart(response.items));
  }, [dispatch]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const response = await cartService.updateCartItem(itemId, quantity);
    dispatch(setCart(response.items));
  }, [dispatch]);

  const removeItem = useCallback(async (itemId: string) => {
    const response = await cartService.removeCartItem(itemId);
    dispatch(setCart(response.items));
  }, [dispatch]);

  const clear = useCallback(async () => {
    await cartService.clearCart();
    dispatch(clearCartState());
  }, [dispatch]);

  return {
    ...cart,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}
