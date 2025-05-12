# Test info

- Name: Subscription & Payment >> should process payment and upgrade subscription
- Location: /home/runner/workspace/tests/subscription.spec.ts:34:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 |
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('Subscription & Payment', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // Login before each test
   7 |     await page.goto('/auth');
   8 |     await page.fill('input[name="email"]', 'test@example.com');
   9 |     await page.fill('input[name="password"]', 'testPassword123');
  10 |     await page.click('button:has-text("Login")');
  11 |   });
  12 |
  13 |   test('should enforce workflow limits', async ({ page }) => {
  14 |     // Assuming free tier has 2 workflow limit
  15 |     await page.goto('/create-workflow');
  16 |     
  17 |     // Create first workflow
  18 |     await page.fill('input[name="name"]', 'Workflow 1');
  19 |     await page.click('button:has-text("Create Workflow")');
  20 |     
  21 |     // Create second workflow
  22 |     await page.goto('/create-workflow');
  23 |     await page.fill('input[name="name"]', 'Workflow 2');
  24 |     await page.click('button:has-text("Create Workflow")');
  25 |     
  26 |     // Try to create third workflow
  27 |     await page.goto('/create-workflow');
  28 |     await page.fill('input[name="name"]', 'Workflow 3');
  29 |     await page.click('button:has-text("Create Workflow")');
  30 |     
  31 |     await expect(page.locator('.error-message')).toContainText('maximum number of workflows');
  32 |   });
  33 |
> 34 |   test('should process payment and upgrade subscription', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  35 |     await page.goto('/subscription');
  36 |     await page.click('button:has-text("Upgrade to Pro")');
  37 |     
  38 |     // Fill PayPal sandbox test credentials
  39 |     const paypalFrame = page.frameLocator('.paypal-button-iframe');
  40 |     await paypalFrame.locator('input[name="email"]').fill('sb-buyer@paypal.com');
  41 |     await paypalFrame.locator('input[name="password"]').fill('sandbox-password');
  42 |     await paypalFrame.locator('button[type="submit"]').click();
  43 |     
  44 |     await expect(page.locator('.subscription-status')).toContainText('Pro');
  45 |   });
  46 | });
  47 |
```