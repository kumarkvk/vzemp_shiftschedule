import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { cartService } from '@/api/services/cartService';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { reportError } from '@/lib/monitoring';
import type { Cart, CartItem, Product } from '@/types';

interface CartContextValue {
  cart: Cart;
  isLoading: boolean;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const emptyCart: Cart = { items: [], total: 0 };
const calculateTotal = (items: CartItem[]): number => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
const normalizeCart = (cart: Cart): Cart => ({ items: cart.items, total: calculateTotal(cart.items) });

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useLocalStorage<Cart>('ecommerce.cart', emptyCart);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    setIsLoading(true);
    try {
      const latest = await cartService.get();
      setCart(normalizeCart(latest));
    } catch (error) {
      reportError(error, { area: 'cart-refresh' });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setCart]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    const existing = cart.items.find((item) => item.product.id === product.id);
    const nextItems = existing
      ? cart.items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...cart.items, { id: product.id, product, quantity }];
    setCart({ items: nextItems, total: calculateTotal(nextItems) });
    if (isAuthenticated) {
      try {
        await cartService.add(product.id, quantity);
        await refreshCart();
      } catch (error) {
        reportError(error, { area: 'cart-add' });
      }
    }
  }, [cart.items, isAuthenticated, refreshCart, setCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const nextItems = cart.items.map((item) => item.id === itemId ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    setCart({ items: nextItems, total: calculateTotal(nextItems) });
    if (isAuthenticated) {
      try {
        await cartService.update(itemId, quantity);
        await refreshCart();
      } catch (error) {
        reportError(error, { area: 'cart-update' });
      }
    }
  }, [cart.items, isAuthenticated, refreshCart, setCart]);

  const removeItem = useCallback(async (itemId: string) => {
    const nextItems = cart.items.filter((item) => item.id !== itemId);
    setCart({ items: nextItems, total: calculateTotal(nextItems) });
    if (isAuthenticated) {
      try {
        await cartService.remove(itemId);
        await refreshCart();
      } catch (error) {
        reportError(error, { area: 'cart-remove' });
      }
    }
  }, [cart.items, isAuthenticated, refreshCart, setCart]);

  const clearCart = useCallback(async () => {
    setCart(emptyCart);
    if (isAuthenticated) {
      try {
        await cartService.clear();
      } catch (error) {
        reportError(error, { area: 'cart-clear' });
      }
    }
  }, [isAuthenticated, setCart]);

  const value = useMemo(() => ({ cart, isLoading, itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0), addItem, updateItem, removeItem, clearCart, refreshCart }), [addItem, cart, clearCart, isLoading, refreshCart, removeItem, updateItem]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
