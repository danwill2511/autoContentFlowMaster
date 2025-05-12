# Test info

- Name: Authentication Flow >> should login existing user
- Location: /home/runner/workspace/tests/auth.spec.ts:20:3

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
   4 | test.describe('Authentication Flow', () => {
   5 |   test('should register a new user', async ({ page }) => {
   6 |     await page.goto('/auth');
   7 |     await page.click('text=Register');
   8 |     
   9 |     await page.fill('input[name="username"]', `testuser${Date.now()}`);
  10 |     await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
  11 |     await page.fill('input[name="password"]', 'testPassword123');
  12 |     await page.fill('input[name="confirmPassword"]', 'testPassword123');
  13 |     
  14 |     await page.click('button:has-text("Register")');
  15 |     
  16 |     await expect(page).toHaveURL('/');
  17 |     await expect(page.locator('h1')).toContainText('Welcome back');
  18 |   });
  19 |
> 20 |   test('should login existing user', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  21 |     await page.goto('/auth');
  22 |     await page.fill('input[name="email"]', 'test@example.com');
  23 |     await page.fill('input[name="password"]', 'testPassword123');
  24 |     await page.click('button:has-text("Login")');
  25 |     
  26 |     await expect(page).toHaveURL('/');
  27 |   });
  28 | });
  29 |
```