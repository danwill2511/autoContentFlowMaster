import { test, expect } from '@playwright/test';
import { setupTestData } from './setup';

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/');
  });

  test('should render showcase page with all new components', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Verify the page title is visible
    await expect(page.locator('h1')).toContainText('UI Component Showcase');
    
    // Check if all the component sections are rendered
    await expect(page.locator('text=Gamification System')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Animated Elements')).toBeVisible();
    await expect(page.locator('text=Theme Customization')).toBeVisible();
    await expect(page.locator('text=Shopify Integration')).toBeVisible();
  });

  test('should navigate between tabs in the showcase page', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Check if the page has loaded
    await expect(page.locator('h1')).toContainText('UI Component Showcase');
    
    // Test tab navigation
    await page.click('button:has-text("Gamification")');
    await expect(page.locator('h2')).toContainText('Gamified User Engagement Tracker');
    
    await page.click('button:has-text("AI Assistant")');
    await expect(page.locator('h2')).toContainText('Contextual AI Help Bubble');
    
    await page.click('button:has-text("Animations")');
    await expect(page.locator('h2')).toContainText('Micro-Interaction Animations');
    
    await page.click('button:has-text("Theme")');
    await expect(page.locator('h2')).toContainText('One-Click Theme Switcher');
    
    await page.click('button:has-text("Integrations")');
    await expect(page.locator('h2')).toContainText('Shopify App Integration');
  });

  test('should render achievement badges correctly', async ({ page }) => {
    // Navigate to showcase page and go to gamification tab
    await page.goto('/showcase');
    await page.click('button:has-text("Gamification")');
    
    // Check if achievement badges are visible
    const achievementCards = page.locator('.space-y-1 >> text=Achievement');
    await expect(achievementCards).toBeVisible();
    
    // Check if the unlocked achievement has a green checkmark
    const unlockedAchievements = page.locator('text=Workflow Creator').first();
    await expect(unlockedAchievements).toBeVisible();
    
    // Check if there's a progress indicator for achievements in progress
    const progressIndicator = page.locator('text=Progress');
    await expect(progressIndicator).toBeVisible();
  });

  test('should render Shopify integration component', async ({ page }) => {
    // Navigate to showcase page and go to integrations tab
    await page.goto('/showcase');
    await page.click('button:has-text("Integrations")');
    
    // Check if Shopify integration component is visible
    await expect(page.locator('text=Shopify Integration')).toBeVisible();
    await expect(page.locator('text=Connect your Shopify store')).toBeVisible();
    
    // Test the connect store button
    const connectButton = page.locator('button:has-text("Connect Store")');
    await expect(connectButton).toBeVisible();
    
    // Check if clicking the connect button opens a dialog
    await connectButton.click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Connect Shopify Store')).toBeVisible();
  });

  test('should render theme switcher component', async ({ page }) => {
    // Navigate to showcase page and go to theme tab
    await page.goto('/showcase');
    await page.click('button:has-text("Theme")');
    
    // Check if theme options are visible
    await expect(page.locator('text=Choose your preferred color scheme')).toBeVisible();
    
    // Check if theme options are available
    const themeOptions = ['Blue', 'Purple', 'Green', 'Orange', 'Pink', 'Dark'];
    for (const theme of themeOptions) {
      await expect(page.locator(`text=${theme}`)).toBeVisible();
    }
    
    // Check if the current theme has an indicator
    await expect(page.locator('.bg-green-500')).toBeVisible();
  });

  test('should render animated counter and progress components', async ({ page }) => {
    // Navigate to showcase page and go to animations tab
    await page.goto('/showcase');
    await page.click('button:has-text("Animations")');
    
    // Check if animation components are visible
    await expect(page.locator('text=Animated Counter')).toBeVisible();
    await expect(page.locator('text=Progress Bars')).toBeVisible();
    
    // Check animated chart is visible
    await expect(page.locator('text=Bar Chart')).toBeVisible();
    
    // Check if animation icon types are visible
    const animationTypes = ['Pulse', 'Bounce', 'Spin', 'Tada'];
    for (const type of animationTypes) {
      await expect(page.locator(`text=${type}`)).toBeVisible();
    }
  });
});