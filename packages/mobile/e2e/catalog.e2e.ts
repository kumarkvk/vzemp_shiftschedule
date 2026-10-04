describe('Catalog flow', () => {
  it('renders products list', async () => expect(element(by.id('products-list'))).toBeVisible());
  it('supports product search', async () => expect(element(by.id('product-search-input'))).toBeVisible());
  it('opens product details', async () => {});
  it('shares a product', async () => {});
});
