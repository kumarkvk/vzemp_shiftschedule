import { expect, test } from '@playwright/test';
import { installMockApi } from './fixtures/mockApi';

test.beforeEach(async ({ page }) => {
  await installMockApi(page);
});

test('validates required login fields', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-submit').click();
  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Password is required.')).toBeVisible();
});

test('logs a customer in and reaches protected routes', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill('Password123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'Order history' })).toBeVisible();
});

test('validates password confirmation on registration', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('First name').fill('Jamie');
  await page.getByLabel('Last name').fill('Customer');
  await page.getByLabel('Email').fill('jamie@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByLabel('Confirm password').fill('Different456');
  await page.locator('main').getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});

test('redirects unauthenticated users to login for checkout', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login/);
});

test('updates profile settings for authenticated users', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill('Password123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.goto('/profile');
  await page.getByLabel('Phone').fill('555-123-4567');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile updated')).toBeVisible();
});
