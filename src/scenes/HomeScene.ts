import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { InputManager } from '@/systems/InputManager';
import { AchievementNotification } from '@/systems/AchievementNotification';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    Effects.init(this);
    AchievementNotification.setupListeners(this);
    AudioManager.playMusic('music_home');

    this.createBackground(width, height);
    
    this.createDecorations(width, height);
    
    this.createLogo(centerX, safeTop + 40);
    this.createStats(centerX, safeTop + 160);
    this.createButtons(centerX, height / 2 + 40);
    
    this.updateStreak();
  }
  
  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.CREAM);
    
    // Subtle pattern overlay
    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.5);
    
    // Top decoration - soft curve
    const topDeco = this.add.graphics();
    topDeco.fillStyle(COLORS.SOFT_PEACH, 0.6);
    topDeco.beginPath();
    topDeco.moveTo(0, 0);
    topDeco.lineTo(width, 0);
    topDeco.lineTo(width, 150);
    topDeco.lineTo(width / 2, 200);
    topDeco.lineTo(0, 150);
    topDeco.closePath();
    topDeco.fillPath();
  }
  
  private createDecorations(width: number, height: number): void {
    // Floating decorative shapes
    const decorations = [
      { x: 50, y: 120, emoji: '🔧', scale: 0.7, delay: 0 },
      { x: width - 40, y: 180, emoji: '✨', scale: 0.6, delay: 200 },
      { x: 70, y: height - 200, emoji: '🌸', scale: 0.5, delay: 400 },
      { x: width - 60, y: height - 150, emoji: '🏠', scale: 0.6, delay: 600 },
    ];
    
    decorations.forEach(deco => {
      const text = this.add.text(deco.x, deco.y, deco.emoji, {
        fontSize: `${Math.round(32 * deco.scale)}px`,
      }).setOrigin(0.5);
      
      text.setAlpha(0);
      
      this.tweens.add({
        targets: text,
        alpha: 0.6,
        y: deco.y - 10,
        duration: 1000,
        delay: deco.delay,
        ease: 'Sine.out',
        yoyo: true,
        repeat: -1,
        repeatDelay: 2000,
      });
    });
  }
  
  private createLogo(x: number, y: number): void {
    const container = this.add.container(x, y);
    
    // Main title
    const title = this.add.text(0, 0, 'Tiny Fixers', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '52px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);
    
    // Shadow effect for title
    title.setShadow(0, 4, colorToHex(COLORS.CORAL_DARK), 0, true, false);
    
    // Subtitle
    const subtitle = this.add.text(0, 50, 'Help fix tiny problems!', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);
    
    container.add([title, subtitle]);
    
    // Entrance animation
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: ANIMATIONS.SPRING_EASE,
      delay: 200,
    });
    
    // Subtle pulse on title
    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 800,
    });
  }
  
  private createStats(x: number, y: number): void {
    const container = this.add.container(x, y);
    
    // Stats panel
    const panelWidth = 280;
    const panel = this.add.rectangle(0, 0, panelWidth, 50, COLORS.WARM_WHITE, 0.9);
    panel.setStrokeStyle(2, 0xFFFFFF, 1);
    
    // Coins
    const coinIcon = this.add.image(-80, 0, 'coin').setScale(0.8);
    const coinsText = this.add.text(-55, 0, `${StateManager.state.economy.coins}`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0, 0.5);
    
    // Stars
    const starIcon = this.add.image(50, 0, 'star_filled').setScale(0.7);
    const starsText = this.add.text(75, 0, `${StateManager.state.progress.totalStars}`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0, 0.5);
    
    container.add([panel, coinIcon, coinsText, starIcon, starsText]);
    
    // Entrance
    container.setAlpha(0);
    container.y = y + 20;
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      ease: ANIMATIONS.SMOOTH_EASE,
      delay: 400,
    });
    
    // Store for updates
    container.setData('coinsText', coinsText);
  }
  
  private createButtons(x: number, startY: number): void {
    const spacing = 70;
    
    this.createButton(x, startY, 'PLAY', 220, 64, () => {
      this.scene.start('LevelSelectScene');
    }, COLORS.CORAL, true);
    
    // Daily Challenge
    const dailyCompleted = StateManager.state.daily.todayChallengeCompleted;
    const dailyLabel = dailyCompleted ? 'Done for today! ✓' : 'Daily Challenge';
    this.createButton(x, startY + spacing, dailyLabel, 200, 56, () => {
      if (!dailyCompleted) {
        this.startDailyChallenge();
      }
    }, dailyCompleted ? COLORS.SAGE : COLORS.SKY, false);
    
    // Endless Mode
    this.createButton(x, startY + spacing * 2, 'Endless Mode', 200, 56, () => {
      this.scene.start('EndlessScene');
    }, COLORS.LAVENDER, false);
    
    // Hub button
    this.createButton(x, startY + spacing * 3, 'My Neighborhood', 200, 56, () => {
      this.scene.start('HubScene');
    }, COLORS.MUSTARD, false);
    
    // Achievements button
    const achievementProgress = StateManager.getAchievementProgress();
    const achievementLabel = `Achievements (${achievementProgress.unlocked}/${achievementProgress.total})`;
    this.createButton(x, startY + spacing * 4, achievementLabel, 200, 56, () => {
      this.scene.start('AchievementsScene');
    }, COLORS.SAGE, false);
    
    // Settings - smaller, top right
    this.createSettingsButton(x + 150, UI.SAFE_AREA_TOP + 30);
  }
  
  private createButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    callback: () => void,
    color: number,
    isPrimary: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Shadow
    const shadow = this.add.rectangle(0, 4, width, height, 0x000000, 0.1);
    shadow.setStrokeStyle(0);
    
    // Button body
    const btn = this.add.rectangle(0, 0, width, height, color, 1);
    btn.setStrokeStyle(3, 0xFFFFFF, 0.5);
    
    // Label
    const label = this.add.text(0, 0, text, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: isPrimary ? '24px' : '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    
    container.add([shadow, btn, label]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });
    
    // Hover/press effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.03,
        duration: 150,
        ease: ANIMATIONS.SMOOTH_EASE,
      });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: ANIMATIONS.SMOOTH_EASE,
      });
      container.y = y;
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 50,
      });
      container.y = y + 2;
    });

    container.on('pointerup', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100,
        ease: ANIMATIONS.BOUNCE_EASE,
        onComplete: () => {
          AudioManager.playSound('click');
          InputManager.vibrate(20);
          callback();
        },
      });
      container.y = y;
    });
    
    // Entrance animation
    container.setAlpha(0);
    container.y += 30;
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      ease: ANIMATIONS.SMOOTH_EASE,
      delay: 500 + (y - 400) / 70 * 100,
    });
    
    return container;
  }
  
  private createSettingsButton(x: number, y: number): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.circle(0, 0, 24, COLORS.WARM_WHITE, 0.8);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);
    
    const icon = this.add.text(0, 0, '⚙', {
      fontSize: '24px',
    }).setOrigin(0.5);
    
    container.add([bg, icon]);
    
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 24),
      Phaser.Geom.Circle.Contains
    );
    
    container.on('pointerover', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 1);
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 150,
      });
    });
    
    container.on('pointerout', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 0.8);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
      });
    });

    container.on('pointerdown', () => {
      this.tweens.add({ targets: container, scale: 0.95, duration: 50 });
    });
    
    container.on('pointerup', () => {
      this.tweens.add({ 
        targets: container, 
        scale: 1, 
        duration: 100,
        ease: 'Back.out',
        onComplete: () => {
          AudioManager.playSound('click');
          this.scene.start('SettingsScene');
        }
      });
    });
  }

  private updateStreak(): void {
    const { streak, isNewDay } = StateManager.updateDailyStreak();

    if (isNewDay && streak > 1) {
      this.showStreakReward(streak);
    }
  }

  private showStreakReward(streak: number): void {
    const reward = StateManager.getDailyReward();
    StateManager.addCoins(reward);

    const { width, height } = this.scale;
    
    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);
    
    // Panel
    const panel = this.add.container(width / 2, height / 2);
    
    const panelBg = this.add.rectangle(0, 0, 300, 220, COLORS.WARM_WHITE);
    panelBg.setStrokeStyle(3, COLORS.MUSTARD, 1);
    
    const title = this.add.text(0, -70, '🔥 Streak Bonus!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);
    
    const streakLabel = this.add.text(0, -25, `${streak} Day Streak!`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '22px',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);
    
    const rewardText = this.add.text(0, 20, `+${reward}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '48px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0.5);
    
    const coinLabel = this.add.text(0, 55, 'coins', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '16px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);
    
    const okBtn = this.add.text(0, 85, 'Awesome!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.SKY),
    }).setOrigin(0.5);
    
    panel.add([panelBg, title, streakLabel, rewardText, coinLabel, okBtn]);
    
    Effects.popIn(panel);
    Effects.confetti(width / 2, height / 2 - 100, 25);
    
    okBtn.setInteractive({ useHandCursor: true });
    okBtn.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
    });
  }

  private startDailyChallenge(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    let prefix: string;
    let levelMin: number;
    let levelMax: number;

    if (dayOfWeek === 0) {
      const types = ['sort', 'untangle', 'pack'];
      const typeIndex = dateSeed % 3;
      prefix = types[typeIndex];
      levelMin = types[typeIndex] === 'pack' ? 21 : 1;
      levelMax = types[typeIndex] === 'pack' ? 30 : 10;
    } else {
      const typeMap: Record<number, { prefix: string; min: number; max: number }> = {
        1: { prefix: 'sort', min: 1, max: 10 },
        2: { prefix: 'untangle', min: 1, max: 10 },
        3: { prefix: 'pack', min: 21, max: 30 },
        4: { prefix: 'sort', min: 1, max: 10 },
        5: { prefix: 'untangle', min: 1, max: 10 },
        6: { prefix: 'pack', min: 21, max: 30 },
      };
      const config = typeMap[dayOfWeek];
      prefix = config.prefix;
      levelMin = config.min;
      levelMax = config.max;
    }

    const levelNum = levelMin + (dateSeed % (levelMax - levelMin + 1));
    const levelId = `${prefix}_${String(levelNum).padStart(2, '0')}`;

    this.scene.start('GameScene', { levelId, isDaily: true });
  }
}