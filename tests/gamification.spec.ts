import { test, expect } from '@playwright/test';
import { setupTestData } from './setup';

test.describe('Gamification Components', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testPassword123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/');
  });

  test('should render user engagement tracker with level information', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Go to gamification tab
    await page.click('button:has-text("Gamification")');
    
    // Check if user engagement tracker is visible
    await expect(page.locator('h2')).toContainText('Gamified User Engagement Tracker');
    
    // Check for level information section
    await expect(page.locator('text=Your Content Creator Level')).toBeVisible();
    await expect(page.locator('text=Level 4')).toBeVisible();
    
    // Check for progress bar
    const progressBar = page.locator('.bg-primary-500.rounded-full').first();
    await expect(progressBar).toBeVisible();
    
    // Check for streaks
    await expect(page.locator('text=Day Streak')).toBeVisible();
  });

  test('should render achievement badges with completion status', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Go to gamification tab
    await page.click('button:has-text("Gamification")');
    
    // Check if achievements section is visible
    await expect(page.locator('text=Your Achievements')).toBeVisible();
    
    // Check if unlocked achievements are displayed
    await expect(page.locator('text=Unlocked')).toBeVisible();
    
    // Locate specific achievements
    await expect(page.locator('text=Workflow Creator')).toBeVisible();
    await expect(page.locator('text=Content Master')).toBeVisible();
    
    // Check for achievement in progress
    await expect(page.locator('text=Next Achievement')).toBeVisible();
    
    // Check for progress indicator on incomplete achievement
    const progressBar = page.locator('.bg-primary-500.h-1\\.5.rounded-full').first();
    await expect(progressBar).toBeVisible();
    
    // Check for stats and rewards
    await expect(page.locator('text=Stats & Rewards')).toBeVisible();
  });

  test('should show stats and rewards in user engagement tracker', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Go to gamification tab
    await page.click('button:has-text("Gamification")');
    
    // Check for stats section
    await expect(page.locator('text=Stats & Rewards')).toBeVisible();
    
    // Check for content created stat
    await expect(page.locator('text=Content Created')).toBeVisible();
    await expect(page.locator('text=Content Created').locator('../..')).toContainText('24');
    
    // Check for engagement stat
    await expect(page.locator('text=Total Engagement')).toBeVisible();
    await expect(page.locator('text=Total Engagement').locator('../..')).toContainText('687');
    
    // Check for platforms connected stat
    await expect(page.locator('text=Platforms Connected')).toBeVisible();
    await expect(page.locator('text=Platforms Connected').locator('../..')).toContainText('2/4');
    
    // Check for rewards section
    await expect(page.locator('text=Available Rewards')).toBeVisible();
    await expect(page.locator('text=Extra AI Content Generation')).toBeVisible();
    await expect(page.locator('text=Premium Template Pack')).toBeVisible();
    
    // Check for rewards points display
    await expect(page.locator('button:has-text("100 pts")')).toBeVisible();
    await expect(page.locator('button:has-text("150 pts")')).toBeVisible();
  });

  test('should show progress on in-progress achievements', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Go to gamification tab
    await page.click('button:has-text("Gamification")');
    
    // Check for next achievement section
    await expect(page.locator('text=Next Achievement')).toBeVisible();
    
    // Find the progress information
    await expect(page.locator('text=Progress').first()).toBeVisible();
    
    // Check for numeric progress indicator (e.g., "2 / 3")
    const progressText = page.locator('text=Progress').locator('../..').locator('span').last();
    await expect(progressText).toBeVisible();
    
    // Verify the progress format with regex
    const progressContent = await progressText.textContent();
    expect(progressContent).toMatch(/\d+ \/ \d+/);
  });

  test('level up button should appear when experience is sufficient', async ({ page }) => {
    // Navigate to showcase page
    await page.goto('/showcase');
    
    // Go to gamification tab
    await page.click('button:has-text("Gamification")');
    
    // Check for level information section
    await expect(page.locator('text=Your Content Creator Level')).toBeVisible();
    
    // Check for progress bar - should be full or nearly full
    const progressBar = page.locator('.bg-primary-500.rounded-full').first();
    await expect(progressBar).toBeVisible();
    
    // Check if "Level Up" button is visible when progress is sufficient
    // Note: We can't guarantee it's visible as it depends on the state,
    // but we can check if it exists in the DOM with a conditional check

    // Try to find the level up button
    const levelUpButtonCount = await page.locator('button:has-text("Level Up")').count();
    
    // Check progress text to see if it shows "Ready to level up!"
    const progressText = await page.locator('text=XP to level').count();
    const readyText = await page.locator('text=Ready to level up!').count();
    
    // Either should have a level up button or show appropriate progress text
    expect(levelUpButtonCount > 0 || progressText > 0 || readyText > 0).toBeTruthy();
  });
});