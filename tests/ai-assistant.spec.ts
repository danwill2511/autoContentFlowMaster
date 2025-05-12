import { test, expect } from '@playwright/test';
import { setupTestData } from './setup';

test.describe('AI Assistant Component', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/');
  });

  test('should render AI Assistant bubble on showcase page', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Verify the page title is visible
    await expect(page.locator('h1')).toContainText('UI Component Showcase');
    
    // Switch to AI Assistant tab
    await page.click('button:has-text("AI Assistant")');
    
    // Check if AI Assistant section is visible
    await expect(page.locator('h2')).toContainText('Contextual AI Help Bubble');
    await expect(page.locator('text=Playful assistant that provides contextual help')).toBeVisible();
    
    // Check if the features section is visible
    await expect(page.locator('text=Contextual Awareness')).toBeVisible();
    await expect(page.locator('text=Expressive Character')).toBeVisible();
    await expect(page.locator('text=Suggestion Prompts')).toBeVisible();
  });

  test('should open AI Assistant chat panel when bubble is clicked', async ({ page }) => {
    // Navigate to any page that has the AI Assistant
    await page.goto('/showcase');
    
    // Wait for the AI bubble to appear (it has a delay)
    // This targets the floating bubble in the bottom-right corner
    await page.waitForSelector('div.fixed >> text=Hi there', { timeout: 5000 });
    
    // Click on the bubble
    await page.click('div.fixed >> text=Hi there');
    
    // Check if the chat panel is opened
    await expect(page.locator('h3:has-text("Flow")')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    
    // Check if the welcome message is displayed
    await expect(page.locator('.bg-white.border >> text=How can I help')).toBeVisible();
    
    // Check if input field is present
    await expect(page.locator('input[placeholder="Type your message..."]')).toBeVisible();
  });

  test('should send message and receive AI response', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Wait for the AI bubble to appear (it has a delay)
    await page.waitForSelector('div.fixed >> text=Hi there', { timeout: 5000 });
    
    // Click on the bubble
    await page.click('div.fixed >> text=Hi there');
    
    // Type a message
    await page.fill('input[placeholder="Type your message..."]', 'Hello');
    
    // Send the message
    await page.click('button:has-text("Send")');
    
    // Check if our message appears in the chat
    await expect(page.locator('.bg-primary-100 >> text=Hello')).toBeVisible();
    
    // Wait for the AI response (simulated with delay)
    await page.waitForSelector('.bg-white.border:has-text("Hi there!")', { timeout: 5000 });
    
    // Check if we got a response
    await expect(page.locator('.bg-white.border:has-text("Hi there!")')).toBeVisible();
  });

  test('should use contextual hints in AI Assistant', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Wait for the AI bubble to appear (it has a delay)
    await page.waitForSelector('div.fixed >> text=Hi there', { timeout: 5000 });
    
    // Click on the bubble
    await page.click('div.fixed >> text=Hi there');
    
    // Check if contextual hints are visible
    await expect(page.locator('text=Suggested questions')).toBeVisible();
    
    // Click on one of the hints
    await page.click('button:has-text("Try exploring the gamification features")');
    
    // Check if the hint was sent as a message
    await expect(page.locator('.bg-primary-100:has-text("Try exploring the gamification features")')).toBeVisible();
    
    // Wait for the AI response
    await page.waitForSelector('.bg-white.border:has-text("gamification")', { timeout: 5000 });
    
    // Check if we got a specific response about gamification
    await expect(page.locator('.bg-white.border')).toContainText('gamification');
  });

  test('should close AI Assistant chat panel', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Wait for the AI bubble to appear (it has a delay)
    await page.waitForSelector('div.fixed >> text=Hi there', { timeout: 5000 });
    
    // Click on the bubble
    await page.click('div.fixed >> text=Hi there');
    
    // Check if the chat panel is opened
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    
    // Click the close button
    await page.click('button[aria-label="Close"] svg, button >> text="Close"');
    
    // Check if the chat panel is closed and the bubble is visible again
    await expect(page.locator('text=AI Assistant')).not.toBeVisible({ timeout: 1000 });
    await expect(page.locator('div.fixed >> text=Hi there')).toBeVisible();
  });
});