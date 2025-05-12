# Test info

- Name: Workflow Management >> should generate content
- Location: /home/runner/workspace/tests/workflow.spec.ts:24:3

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
   4 | test.describe('Workflow Management', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // Login before each test
   7 |     await page.goto('/auth');
   8 |     await page.fill('input[name="email"]', 'test@example.com');
   9 |     await page.fill('input[name="password"]', 'testPassword123');
  10 |     await page.click('button:has-text("Login")');
  11 |   });
  12 |
  13 |   test('should create new workflow', async ({ page }) => {
  14 |     await page.goto('/create-workflow');
  15 |     await page.fill('input[name="name"]', 'Test Workflow');
  16 |     await page.selectOption('select[name="contentType"]', 'blog');
  17 |     await page.selectOption('select[name="contentTone"]', 'professional');
  18 |     await page.fill('input[name="topics"]', 'technology, AI');
  19 |     await page.click('button:has-text("Create Workflow")');
  20 |     
  21 |     await expect(page.locator('.workflow-card')).toContainText('Test Workflow');
  22 |   });
  23 |
> 24 |   test('should generate content', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  25 |     await page.goto('/workflows/1');
  26 |     await page.click('button:has-text("Generate Content")');
  27 |     await expect(page.locator('.content-preview')).toBeVisible();
  28 |   });
  29 | });
  30 |
```