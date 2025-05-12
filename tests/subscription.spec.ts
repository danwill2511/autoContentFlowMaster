
import { test, expect } from '@playwright/test';

test.describe('Subscription & Payment', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
  });

  test('should enforce workflow limits', async ({ page }) => {
    // Assuming free tier has 2 workflow limit
    await page.goto('/create-workflow');
    
    // Create first workflow
    await page.fill('input[name="name"]', 'Workflow 1');
    await page.click('button:has-text("Create Workflow")');
    
    // Create second workflow
    await page.goto('/create-workflow');
    await page.fill('input[name="name"]', 'Workflow 2');
    await page.click('button:has-text("Create Workflow")');
    
    // Try to create third workflow
    await page.goto('/create-workflow');
    await page.fill('input[name="name"]', 'Workflow 3');
    await page.click('button:has-text("Create Workflow")');
    
    await expect(page.locator('.error-message')).toContainText('maximum number of workflows');
  });

  test('should process payment and upgrade subscription', async ({ page }) => {
    await page.goto('/subscription');
    await page.click('button:has-text("Upgrade to Pro")');
    
    // Fill PayPal sandbox test credentials
    const paypalFrame = page.frameLocator('.paypal-button-iframe');
    await paypalFrame.locator('input[name="email"]').fill('sb-buyer@paypal.com');
    await paypalFrame.locator('input[name="password"]').fill('sandbox-password');
    await paypalFrame.locator('button[type="submit"]').click();
    
    await expect(page.locator('.subscription-status')).toContainText('Pro');
  });
});
