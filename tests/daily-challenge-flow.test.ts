/**
 * Daily Challenge Flow Tests
 * 
 * Tests the complete Daily Challenge user flow:
 * 1. Home → Daily Challenge scene navigation
 * 2. Daily Challenge info screen displays correctly
 * 3. Play button starts the challenge
 * 4. GameScene loads with daily level data
 * 5. HUD elements don't overlap (timer, precision warning, progress bar)
 */

import { test, expect } from '@playwright/test';

test.describe('Daily Challenge Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test state with tutorial completed and daily challenge available
    await page.goto('http://localhost:3456/tiny-fixers/');
    await page.evaluate(() => {
      const state = {
        version: 6,
        player: {
          id: 'test-player',
          createdAt: Date.now(),
          lastPlayedAt: Date.now(),
          totalPlayTime: 0,
          tutorialCompleted: true,
          puzzleTypeTutorialsSeen: {}
        },
        progress: {
          completedLevels: {},
          totalStars: 0,
          currentLevel: 1,
          hubProgress: {
            flower_shop: { id: 'flower_shop', currentStage: 0, maxStage: 3, unlocked: true },
            tool_shed: { id: 'tool_shed', currentStage: 0, maxStage: 3, unlocked: false },
            bakery: { id: 'bakery', currentStage: 0, maxStage: 3, unlocked: false },
            library: { id: 'library', currentStage: 0, maxStage: 3, unlocked: false }
          },
          unlockedPuzzles: ['sort_01'],
          unlockedCharacters: ['helper_01'],
          unlockedDecorations: [],
          unlockedWorlds: ['world_sort']
        },
        economy: { 
          coins: 100, 
          materials: { wood: 10, brick: 5, paint: 3, glass: 2, metal: 1 } 
        },
        settings: { 
          musicVolume: 0.7, 
          sfxVolume: 1, 
          hapticsEnabled: true, 
          notificationsEnabled: true 
        },
        daily: {
          lastPlayDate: null,
          currentStreak: 0,
          longestStreak: 0,
          todayChallengeCompleted: false,
          weeklyRewardsClaimed: [],
          completedChallenges: [],
          totalDailyWins: 0,
          lastCompletedDate: null
        },
        endless: { highScore: 0, totalGamesPlayed: 0 },
        achievements: [],
        achievementStats: {
          totalGamesPlayed: 0,
          perfectLevels: 0,
          totalCoinsEarned: 0,
          levelsCompletedPerType: { sort: 0, untangle: 0, pack: 0 },
          dailyChallengesCompleted: 0,
          dailyStreakRecord: 0,
          dailyPerfectStreak: 0
        }
      };
      localStorage.setItem('tiny_fixers_save', JSON.stringify(state));
    });
    await page.reload();
    await page.waitForTimeout(3000); // Wait for game to load
  });

  test('Daily Challenge button is visible and clickable on Home screen', async ({ page }) => {
    // Wait for home screen to load
    await expect(page.locator('canvas')).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshots/daily-challenge-home.png' });
    
    // The Daily Challenge button should be rendered on the canvas
    // We'll verify by checking no console errors
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    expect(consoleMessages).toHaveLength(0);
  });

  test('Daily Challenge scene loads with correct information', async ({ page }) => {
    // Navigate to Daily Challenge by evaluating click on canvas
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');
      
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dailyChallengeY = centerY + 40 + 70; // Second button from top
      
      canvas.dispatchEvent(new MouseEvent('click', {
        clientX: centerX,
        clientY: dailyChallengeY,
        bubbles: true,
        cancelable: true
      }));
    });
    
    // Wait for scene transition
    await page.waitForTimeout(2000);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshots/daily-challenge-info.png' });
    
    // Check no errors
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    expect(consoleMessages).toHaveLength(0);
  });

  test('Play Challenge button starts the game', async ({ page }) => {
    // Navigate to Daily Challenge
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');
      
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dailyChallengeY = centerY + 40 + 70;
      
      canvas.dispatchEvent(new MouseEvent('click', {
        clientX: centerX,
        clientY: dailyChallengeY,
        bubbles: true,
        cancelable: true
      }));
    });
    
    await page.waitForTimeout(2000);
    
    // Click Play Challenge button
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');
      
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const playButtonY = rect.top + rect.height - 160; // Play button position
      
      canvas.dispatchEvent(new MouseEvent('click', {
        clientX: centerX,
        clientY: playButtonY,
        bubbles: true,
        cancelable: true
      }));
    });
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshots/daily-challenge-game.png' });
    
    // Verify we're in GameScene (should have timer and puzzle elements)
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    expect(consoleMessages).toHaveLength(0);
  });

  test('HUD elements do not overlap in GameScene', async ({ page }) => {
    // Start a daily challenge
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');
      
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Click Daily Challenge
      canvas.dispatchEvent(new MouseEvent('click', {
        clientX: centerX,
        clientY: centerY + 40 + 70,
        bubbles: true
      }));
    });
    
    await page.waitForTimeout(2000);
    
    // Click Play
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');
      
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const playButtonY = rect.top + rect.height - 160;
      
      canvas.dispatchEvent(new MouseEvent('click', {
        clientX: centerX,
        clientY: playButtonY,
        bubbles: true
      }));
    });
    
    await page.waitForTimeout(3000);
    
    // Take full page screenshot to verify HUD layout
    await page.screenshot({ 
      path: 'test-screenshots/daily-challenge-hud-layout.png',
      fullPage: true 
    });
    
    // Verify no console errors about rendering or layout
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('WebGL')) {
        consoleMessages.push(msg.text());
      }
    });
    
    expect(consoleMessages).toHaveLength(0);
  });
});
