import { categoryFixtures, orderFixtures, productFixtures, userFixtures } from '../../src/database/seeds/fixtures';

describe('database seed fixtures', () => {
  it('contains the expected category, product, and user counts', () => {
    expect(categoryFixtures).toHaveLength(5);
    expect(productFixtures).toHaveLength(20);
    expect(userFixtures).toHaveLength(3);
  });

  it('keeps product SKUs unique', () => {
    const uniqueSkus = new Set(productFixtures.map((fixture) => fixture.sku));
    expect(uniqueSkus.size).toBe(productFixtures.length);
  });

  it('links sample orders to known users and products', () => {
    const knownEmails = new Set(userFixtures.map((fixture) => fixture.email));
    const knownSkus = new Set(productFixtures.map((fixture) => fixture.sku));

    for (const order of orderFixtures) {
      expect(knownEmails.has(order.email)).toBe(true);
      for (const line of order.lines) {
        expect(knownSkus.has(line.sku)).toBe(true);
        expect(line.quantity).toBeGreaterThan(0);
      }
    }
  });
});
