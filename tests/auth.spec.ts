
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Register');
    
    await page.fill('input[name="username"]', `testuser${Date.now()}`);
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'testPassword123');
    await page.fill('input[name="confirmPassword"]', 'testPassword123');
    
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
    
    await expect(page).toHaveURL('/');
  });
});
