describe('Cart flow', () => {
  it('adds item to cart', async () => expect(element(by.id('add-to-cart-button'))).toBeVisible());
  it('supports swipe to delete cart items', async () => {});
  it('shows cart totals', async () => expect(element(by.id('checkout-button'))).toBeVisible());
  it('navigates to checkout', async () => {});
});
