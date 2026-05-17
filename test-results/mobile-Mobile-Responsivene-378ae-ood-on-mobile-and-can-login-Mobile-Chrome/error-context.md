# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile.spec.js >> Mobile Responsiveness and UI >> Login screen looks good on mobile and can login
- Location: tests\mobile.spec.js:4:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5173/"
Received: "http://localhost:5173/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5173/login"

```

```yaml
- img
- heading "InventoryPro" [level=1]
- paragraph: Stock Management System
- img
- textbox "Username": admin
- img
- textbox "Password": admin123
- img
- alert:
  - img
  - text: Invalid credentials
- button "Sign In"
- paragraph:
  - text: "Default:"
  - code: admin
  - text: /
  - code: admin123
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Mobile Responsiveness and UI', () => {
  4  |   test('Login screen looks good on mobile and can login', async ({ page }) => {
  5  |     await page.goto('/login');
  6  | 
  7  |     // The login card should be visible
  8  |     const loginCard = page.locator('.login-card');
  9  |     await expect(loginCard).toBeVisible();
  10 | 
  11 |     // Fill in the form
  12 |     await page.fill('input[placeholder="Username"]', 'admin');
  13 |     await page.fill('input[placeholder="Password"]', 'admin123');
  14 |     await page.click('button:has-text("Sign In")');
  15 | 
  16 |     // We should be redirected to dashboard
> 17 |     await expect(page).toHaveURL('/');
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  18 | 
  19 |     // On mobile, the hamburger menu button should be visible in the header
  20 |     const mobileToggle = page.locator('.mobile-header-toggle');
  21 |     await expect(mobileToggle).toBeVisible();
  22 | 
  23 |     // Main sidebar should NOT be visible on mobile
  24 |     const desktopSidebar = page.locator('.sidebar.hidden-mobile');
  25 |     await expect(desktopSidebar).not.toBeVisible();
  26 | 
  27 |     // Click hamburger to open Mobile Drawer
  28 |     await mobileToggle.click();
  29 | 
  30 |     // The drawer should appear
  31 |     const mobileDrawer = page.locator('.mobile-drawer');
  32 |     await expect(mobileDrawer).toBeVisible();
  33 | 
  34 |     // Mobile menu items should be clickable
  35 |     const productsLink = page.locator('.mobile-drawer a:has-text("Products")');
  36 |     await expect(productsLink).toBeVisible();
  37 |     await productsLink.click();
  38 | 
  39 |     // Drawer should close and url should be /products
  40 |     await expect(page).toHaveURL('/products');
  41 |   });
  42 | });
  43 | 
```