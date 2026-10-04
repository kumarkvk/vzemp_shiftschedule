import { expect, test } from '@playwright/test';
import { installMockApi } from './fixtures/mockApi';

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
});

test('filters products with search', async ({ page }) => {
  await page.goto('/products');
  await page.locator('main').getByLabel('Search').fill('Headphones');
  await expect(page.getByText('Noise Cancelling Headphones')).toBeVisible();
});

test('filters products by category', async ({ page }) => {
  await page.goto('/products');
  await page.getByLabel('Category').selectOption('Electronics');
  await expect(page.getByTestId('product-card').first()).toContainText('Electronics');
});

test('sorts products by price descending', async ({ page }) => {
  await page.goto('/products');
  await page.getByLabel('Sort').selectOption('price-desc');
  await expect(page.getByTestId('product-card').first()).toContainText('Demo Product 14');
});

test('paginates catalog results', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Showing 11-14 of 14 products')).toBeVisible();
});

test('adds products to the cart from product detail', async ({ page }) => {
  await page.goto('/products/product-1');
  await page.locator('main').getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.getByText('Cart updated')).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByText('Noise Cancelling Headphones')).toBeVisible();
});

test('updates cart quantity and recalculates totals', async ({ page }) => {
  await page.goto('/products/product-1');
  await page.locator('main').getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/cart');
  await page.locator('input[type="number"]').fill('3');
  await expect(page.locator('dd').filter({ hasText: '$75.00' })).toBeVisible();
});

test('removes items and shows empty cart state', async ({ page }) => {
  await page.goto('/products/product-1');
  await page.locator('main').getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('runs the checkout flow through payment confirmation', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('First name').fill('Jamie');
  await page.getByLabel('Last name').fill('Customer');
  await page.getByLabel('Email').fill('jamie@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByLabel('Confirm password').fill('Password123');
  await page.locator('main').getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.goto('/products/product-1');
  await page.locator('main').getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('123 Main St');
  await page.getByLabel('City').fill('Seattle');
  await page.getByLabel('State').fill('WA');
  await page.getByLabel('ZIP code').fill('98101');
  await page.getByLabel('Country').fill('US');
  await page.getByRole('button', { name: 'Create order' }).click();
  await page.getByLabel('Cardholder name').fill('Jamie Customer');
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByLabel('Expiry').fill('12/29');
  await page.getByLabel('CVC').fill('123');
  await page.getByRole('button', { name: 'Confirm payment' }).click();
  await expect(page).toHaveURL(/\/orders\//);
});
