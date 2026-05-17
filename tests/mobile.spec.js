import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness and UI', () => {
  test('Login screen looks good on mobile and can login', async ({ page }) => {
    await page.goto('/login');

    // The login card should be visible
    const loginCard = page.locator('.login-card');
    await expect(loginCard).toBeVisible();

    // Fill in the form
    await page.fill('input[placeholder="Username"]', 'admin');
    await page.fill('input[placeholder="Password"]', 'admin123');
    await page.click('button:has-text("Sign In")');

    // We should be redirected to dashboard
    await expect(page).toHaveURL('/');

    // On mobile, the hamburger menu button should be visible in the header
    const mobileToggle = page.locator('.mobile-header-toggle');
    await expect(mobileToggle).toBeVisible();

    // Main sidebar should NOT be visible on mobile
    const desktopSidebar = page.locator('.sidebar.hidden-mobile');
    await expect(desktopSidebar).not.toBeVisible();

    // Click hamburger to open Mobile Drawer
    await mobileToggle.click();

    // The drawer should appear
    const mobileDrawer = page.locator('.mobile-drawer');
    await expect(mobileDrawer).toBeVisible();

    // Mobile menu items should be clickable
    const productsLink = page.locator('.mobile-drawer a:has-text("Products")');
    await expect(productsLink).toBeVisible();
    await productsLink.click();

    // Drawer should close and url should be /products
    await expect(page).toHaveURL('/products');
  });
});
