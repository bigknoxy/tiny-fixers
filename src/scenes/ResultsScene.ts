import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { MaterialType, DailyModifier } from '@/config/types';
import { getNextLevel } from '@/data/levels';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { InputManager } from '@/systems/InputManager';

interface ResultsData {
  success: boolean;
  levelId: string;
  stars: number;
  time: number;
  coins: number;
  materials: { type: MaterialType; amount: number }[];
  isDaily?: boolean;
  dailyModifiers?: DailyModifier[];
  wasPrecisionPerfect?: boolean;
}

export class ResultsScene extends Phaser.Scene {
  private resultsData!: ResultsData;
  private sadFaceTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data: ResultsData): void {
    // Safety check: if daily was already completed before this run, don't grant rewards
    // This handles edge cases where GameScene redirect was bypassed
    if (data.isDaily && StateManager.getTodayChallengeCompleted()) {
      data.coins = 0;
      data.isDaily = false; // Treat as regular level for UI purposes
    }
    this.resultsData = data;
  }

  shutdown(): void {
    // Clean up sad face tween
    if (this.sadFaceTween) {
      this.sadFaceTween.stop();
      this.sadFaceTween = null;
    }
  }

  create(): void {
    Effects.init(this);
    
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    // Background
    this.createBackground(width, height);

    if (this.resultsData.success) {
      this.createSuccessUI(centerX, safeTop, height);
      Effects.confetti(centerX, height / 3, 35);
      AudioManager.playSound('success');
    } else {
      this.createFailUI(centerX, safeTop, height);
      AudioManager.playSound('failure');
    }
  }
  
  private createBackground(width: number, height: number): void {
    const bgColor = this.resultsData.success ? COLORS.CREAM : 0xFFF5F5;
    this.add.rectangle(width / 2, height / 2, width, height, bgColor);
    
    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.3);
  }

  private createSuccessUI(x: number, y: number, height: number): void {
    // Daily challenge specific title
    let titleText = 'Level Complete!';
    if (this.resultsData.isDaily) {
      titleText = 'Daily Challenge Complete!';
    }
    
    const title = this.add.text(x, y + 50, titleText, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '40px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.SAGE),
    }).setOrigin(0.5);
    
    title.setShadow(0, 3, colorToHex(COLORS.SAGE_DARK), 0, true, false);

    // Show daily streak info
    if (this.resultsData.isDaily) {
      this.createDailyStreakPanel(x, y + 130);
      this.createStarsRow(x, y + 200);
      this.createRewardsPanel(x, y + 320);

      // Show perfect precision badge if applicable
      if (this.resultsData.wasPrecisionPerfect) {
        this.add.text(x, y + 400, '⭐ Perfect Precision!', {
          fontFamily: UI.FONT_FAMILY_DISPLAY,
          fontSize: '20px',
          fontStyle: 'bold',
          color: colorToHex(COLORS.MUSTARD),
        }).setOrigin(0.5);
      }
    } else {
      this.createStarsRow(x, y + 130);
      this.createRewardsPanel(x, y + 250);
    }

    if (this.resultsData.stars === 3) {
      this.time.delayedCall(1500, () => {
        Effects.celebrate(x, y + 100, 1.5);
      });
    }

    this.createButtons(x, height - 160);
  }

  private createFailUI(x: number, y: number, height: number): void {
    const title = this.add.text(x, y + 50, 'Time\'s Up!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '40px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);
    
    title.setShadow(0, 3, colorToHex(COLORS.CORAL_DARK), 0, true, false);

    this.add.text(x, y + 120, 'Don\'t give up! Try again!', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '20px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);
    
    // Sad face
    const sadFace = this.add.text(x, y + 200, '😅', {
      fontSize: '64px',
    }).setOrigin(0.5);
    
    this.sadFaceTween = this.tweens.add({
      targets: sadFace,
      y: y + 190,
      duration: 1000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    this.createButtons(x, height - 160, true);
  }

  private createDailyStreakPanel(x: number, y: number): void {
    const streak = StateManager.getDailyStreak();
    
    const panel = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 260, 50, COLORS.CORAL, 0.15);
    bg.setStrokeStyle(2, COLORS.CORAL);
    
    const flame = this.add.text(-100, 0, '🔥', {
      fontSize: '28px',
    }).setOrigin(0.5);
    
    const streakText = this.add.text(-50, -8, `${streak.current} Day Streak!`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0, 0.5);
    
    const bestText = this.add.text(-50, 10, `Best: ${streak.longest} days`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '12px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0, 0.5);
    
    panel.add([bg, flame, streakText, bestText]);
    
    panel.setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 500,
      delay: 500,
    });
  }

  private createStarsRow(x: number, y: number): void {
    const container = this.add.container(x, y);
    const spacing = 70;

    for (let i = 0; i < 3; i++) {
      const starX = (i - 1) * spacing;
      const earned = i < this.resultsData.stars;

      const star = this.add.star(starX, 0, 5, 18, 36, earned ? COLORS.MUSTARD : 0xE0E0E0);
      star.setScale(0);

      container.add(star);

      this.time.delayedCall(300 + i * 250, () => {
        this.tweens.add({
          targets: star,
          scaleX: 1,
          scaleY: 1,
          duration: 400,
          ease: ANIMATIONS.SPRING_EASE,
        });
        
        if (earned) {
          AudioManager.playSound('star');
          Effects.starBurst(x + starX, y);
          InputManager.vibrate(30);
        }
      });
    }
  }

  private createRewardsPanel(x: number, y: number): void {
    const container = this.add.container(x, y);
    
    const panelBg = this.add.rectangle(0, 0, 320, 140, COLORS.WARM_WHITE);
    panelBg.setStrokeStyle(3, 0xFFFFFF, 1);
    
    const timeLabel = this.add.text(-120, -40, 'Time', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '14px',
      color: colorToHex(COLORS.SOFT_GRAY),
    }).setOrigin(0, 0.5);
    
    const timeValue = this.add.text(120, -40, this.formatTime(this.resultsData.time), {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(1, 0.5);

    const coinIcon = this.add.image(-110, 0, 'coin').setScale(0.9);
    const coinsValue = this.add.text(120, 0, `+${this.resultsData.coins}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(1, 0.5);

    container.add([panelBg, timeLabel, timeValue, coinIcon, coinsValue]);

    if (this.resultsData.materials && this.resultsData.materials.length > 0) {
      const matLabel = this.add.text(-120, 40, 'Materials', {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '14px',
        color: colorToHex(COLORS.SOFT_GRAY),
      }).setOrigin(0, 0.5);
      
      const matText = this.resultsData.materials.map(m => `${m.amount} ${m.type}`).join(', ');
      const matValue = this.add.text(120, 40, matText, {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '16px',
        color: colorToHex(COLORS.CHARCOAL),
      }).setOrigin(1, 0.5);
      
      container.add([matLabel, matValue]);
    }

    container.setAlpha(0);
    container.y += 30;
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 500,
      delay: 800,
      ease: ANIMATIONS.SMOOTH_EASE,
      onComplete: () => {
        if (this.resultsData.success && this.resultsData.coins > 0) {
          Effects.coinPopup(x + 60, y, this.resultsData.coins);
        }
      },
    });
  }

  private createButtons(x: number, y: number, isRetry: boolean = false): void {
    const nextLevel = !isRetry && !this.resultsData.isDaily ? getNextLevel(this.resultsData.levelId) : null;

    if (nextLevel) {
      this.createButton(x, y - 60, 'Next Level', 220, 56, () => {
        this.scene.start('GameScene', { levelId: nextLevel.id });
      }, COLORS.SAGE);
    }

    this.createButton(x, y, 'Retry', 220, 56, () => {
      this.scene.start('GameScene', { levelId: this.resultsData.levelId, isDaily: this.resultsData.isDaily });
    }, COLORS.SKY);

    this.createButton(x, y + 70, 'Home', 220, 56, () => {
      this.scene.start('HomeScene');
    }, COLORS.CORAL);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    callback: () => void,
    color: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 4, width, height, 0x000000, 0.1);
    const bg = this.add.rectangle(0, 0, width, height, color);
    bg.setStrokeStyle(3, 0xFFFFFF, 0.5);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.03, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.tweens.add({ targets: container, scale: 0.95, duration: 50 });
    });

    container.on('pointerup', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
        onComplete: () => {
          AudioManager.playSound('click');
          InputManager.vibrate(15);
          callback();
        },
      });
    });

    // Entrance animation
    container.setAlpha(0);
    container.y += 20;
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      delay: 1000 + (y % 200),
      ease: ANIMATIONS.SMOOTH_EASE,
    });

    return container;
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}