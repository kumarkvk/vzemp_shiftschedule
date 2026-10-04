import { expect, test } from '@playwright/test';
import { installMockApi } from './fixtures/mockApi';

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
});

test('renders the home page and featured products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Production-ready ecommerce experiences for every screen.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();
  await expect(page.getByTestId('product-card').first()).toBeVisible();
});

test('navigates to the products catalog from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('products-link').click();
  await expect(page).toHaveURL(/\/products/);
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
});

test('shows breadcrumb navigation on inner routes', async ({ page }) => {
  await page.goto('/products/product-1');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Products');
});

test('shows a helpful 404 state for missing routes', async ({ page }) => {
  await page.goto('/unknown-route');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
