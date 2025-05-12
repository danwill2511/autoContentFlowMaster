
import { test, expect } from '@playwright/test';

test.describe('Workflow Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
  });

  test('should create new workflow', async ({ page }) => {
    await page.goto('/create-workflow');
    await page.fill('input[name="name"]', 'Test Workflow');
    await page.selectOption('select[name="contentType"]', 'blog');
    await page.selectOption('select[name="contentTone"]', 'professional');
    await page.fill('input[name="topics"]', 'technology, AI');
    await page.click('button:has-text("Create Workflow")');
    
    await expect(page.locator('.workflow-card')).toContainText('Test Workflow');
  });

  test('should generate content', async ({ page }) => {
    await page.goto('/workflows/1');
    await page.click('button:has-text("Generate Content")');
    await expect(page.locator('.content-preview')).toBeVisible();
  });
});
