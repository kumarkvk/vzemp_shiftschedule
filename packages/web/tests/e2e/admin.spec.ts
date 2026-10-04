import { expect, test } from '@playwright/test';
import { installMockApi } from './fixtures/mockApi';

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Password123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('shows admin dashboard metrics', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
  await expect(page.getByText('3250')).toBeVisible();
});

test('lists products in the admin table', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page.getByRole('heading', { name: 'Admin products' })).toBeVisible();
  await expect(page.getByText('Noise Cancelling Headphones')).toBeVisible();
});

test('creates a new product from the admin modal', async ({ page }) => {
  await page.goto('/admin/products');
  await page.getByTestId('add-product-button').click();
  const dialog = page.locator('[role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Add a new product' }) });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Name', { exact: true }).fill('New Test Product');
  await dialog.getByLabel('Description').fill('Created from Playwright.');
  await dialog.getByLabel('Price').fill('99');
  await dialog.getByLabel('Inventory').fill('15');
  await dialog.getByLabel('Category name').fill('Testing');
  await dialog.getByLabel('Image URL').fill('https://example.com/product.png');
  await dialog.getByRole('button', { name: 'Create product' }).click();
  await expect(page.getByText('Product created')).toBeVisible();
  await expect(page.getByText('New Test Product', { exact: true })).toBeVisible();
});

test('edits an existing product', async ({ page }) => {
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'Edit' }).first().click();
  const dialog = page.locator('[role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Edit product' }) });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Name', { exact: true }).fill('Updated Demo Product');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Product updated')).toBeVisible();
  await expect(page.getByText('Updated Demo Product', { exact: true })).toBeVisible();
});

test('deletes a product', async ({ page }) => {
  await page.goto('/admin/products');
  const firstRowName = page.locator('tbody tr').first().locator('td').first();
  const productName = await firstRowName.innerText();
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('Product deleted')).toBeVisible();
  await expect(page.getByText(productName)).not.toBeVisible();
});
