# Test info

- Name: Authentication Flow >> should register a new user
- Location: /home/runner/workspace/tests/auth.spec.ts:5:3

# Error details

```
Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Please install them with the following command:      ║
║                                                      ║
║     sudo npx playwright install-deps                 ║
║                                                      ║
║ Alternatively, use apt:                              ║
║     sudo apt-get install libglib2.0-0\               ║
║         libnss3\                                     ║
║         libnspr4\                                    ║
║         libdbus-1-3\                                 ║
║         libatk1.0-0\                                 ║
║         libatk-bridge2.0-0\                          ║
║         libatspi2.0-0\                               ║
║         libx11-6\                                    ║
║         libxcomposite1\                              ║
║         libxdamage1\                                 ║
║         libxext6\                                    ║
║         libxfixes3\                                  ║
║         libxrandr2\                                  ║
║         libgbm1\                                     ║
║         libxcb1\                                     ║
║         libxkbcommon0\                               ║
║         libasound2                                   ║
║                                                      ║
║ <3 Playwright Team                                   ║
╚══════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 |
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('Authentication Flow', () => {
>  5 |   test('should register a new user', async ({ page }) => {
     |   ^ Error: browserType.launch: 
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
  20 |   test('should login existing user', async ({ page }) => {
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