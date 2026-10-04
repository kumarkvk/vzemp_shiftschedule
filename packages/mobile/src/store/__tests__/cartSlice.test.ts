import cartReducer, { clearCartState, setCart } from '@/store/slices/cartSlice';

describe('cartSlice', () => {
  const item = {
    id: '1',
    quantity: 2,
    product: { id: 'p1', name: 'Headphones', description: '', price: 99, imageUrl: '', inventory: 3, category: { id: 'c1', name: 'Electronics' } },
  };

  it('calculates subtotal', () => {
    const state = cartReducer(undefined, setCart([item] as never));
    expect(state.subtotal).toBe(198);
  });

  it('clears the cart', () => {
    const state = cartReducer({ items: [item] as never[], subtotal: 198 }, clearCartState());
    expect(state.items).toHaveLength(0);
  });
});
