import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI } from '@/config/game.config';
import { PuzzleType, DailyModifier, DailyModifierType } from '@/config/types';
import { StateManager } from '@/core/StateManager';
import { EventBus } from '@/core/EventBus';
import { generateDailyLevel } from '@/data/dailyGenerator';
import { getTypeColor } from '@/utils/puzzle';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { InputManager } from '@/systems/InputManager';

export class DailyChallengeScene extends Phaser.Scene {
  private dailyLevel!: ReturnType<typeof generateDailyLevel>;
  private modifierTweens: Phaser.Tweens.Tween[] = [];
  private alreadyCompleted: boolean = false;

  constructor() {
    super({ key: 'DailyChallengeScene' });
  }

  init(data: { alreadyCompleted?: boolean } = {}): void {
    this.alreadyCompleted = data.alreadyCompleted || false;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    Effects.init(this);

    this.createBackground(width, height);

    // Get daily challenge
    this.dailyLevel = generateDailyLevel();

    // Emit start event
    EventBus.emit('daily:challenge:start', {
      puzzleType: this.dailyLevel.type,
      difficulty: this.dailyLevel.difficulty,
    });

    this.createHeader(centerX, safeTop);
    this.createPuzzleInfo(centerX, safeTop + 120);
    this.createModifiers(centerX, safeTop + 220);
    this.createStreakInfo(centerX, safeTop + 340);
    this.createRewardsPreview(centerX, safeTop + 420);
    this.createPlayButton(centerX, height - 160);
    this.createBackButton(40, safeTop - 10);
  }

  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.CREAM);

    // Decorative gradient at top
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(COLORS.CORAL, COLORS.CORAL, COLORS.SOFT_PEACH, COLORS.SOFT_PEACH, 0.3);
    gradient.fillRect(0, 0, width, 200);
  }

  private createHeader(x: number, y: number): void {
    const title = this.add.text(x, y, 'Daily Challenge', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    title.setShadow(0, 2, '#00000033', 0, true, false);

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const dateText = this.add.text(x, y + 40, dateStr, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    dateText.setAlpha(0.9);
  }

  private createPuzzleInfo(x: number, y: number): void {
    const typeColor = getTypeColor(this.dailyLevel.type);
    const puzzleNames: Record<PuzzleType, string> = {
      [PuzzleType.SORT]: 'Sorting',
      [PuzzleType.UNTANGLE]: 'Untangle',
      [PuzzleType.PACK]: 'Packing',
    };

    // Puzzle type badge
    const badgeBg = this.add.rectangle(x, y, 180, 70, COLORS.WARM_WHITE);
    badgeBg.setStrokeStyle(3, typeColor);

    this.add.text(x - 60, y, this.getPuzzleIcon(this.dailyLevel.type), {
      fontSize: '36px',
    }).setOrigin(0.5);

    this.add.text(x, y - 10, puzzleNames[this.dailyLevel.type], {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: colorToHex(typeColor),
    }).setOrigin(0.5);

    this.add.text(x, y + 18, `Difficulty: ${this.dailyLevel.difficulty}/5`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '14px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    Effects.popIn(badgeBg);
  }

  private createModifiers(x: number, y: number): void {
    const modifiers = this.dailyLevel.modifiers ?? [];

    if (modifiers.length === 0) return;

    this.add.text(x, y - 30, 'MODIFIERS', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.GRAPHITE),
      letterSpacing: 2,
    }).setOrigin(0.5);

    const modifierWidth = 100;
    const totalWidth = modifiers.length * modifierWidth;
    const startX = x - totalWidth / 2 + modifierWidth / 2;

    modifiers.forEach((mod: DailyModifier, i: number) => {
      const modX = startX + i * modifierWidth;

      const modBg = this.add.rectangle(modX, y + 20, 90, 60, this.getModifierColor(mod.type));
      modBg.setStrokeStyle(2, 0xFFFFFF);

      const icon = this.add.text(modX, y, mod.icon, {
        fontSize: '24px',
      }).setOrigin(0.5);

      this.add.text(modX, y + 25, mod.name, {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      Effects.popIn(modBg, () => {
        const tween = this.tweens.add({
          targets: icon,
          scale: 1.2,
          duration: 300,
          yoyo: true,
          repeat: -1,
          delay: i * 200,
        });
        this.modifierTweens.push(tween);
      });
    });
  }

  private createStreakInfo(x: number, y: number): void {
    const streak = StateManager.getDailyStreak();
    const isCompleted = StateManager.getTodayChallengeCompleted();

    // Streak panel
    const panel = this.add.rectangle(x, y, 280, 60, COLORS.WARM_WHITE);
    panel.setStrokeStyle(2, 0xFFFFFF);

    this.add.text(x - 100, y, '🔥', {
      fontSize: '32px',
    }).setOrigin(0.5);

    this.add.text(x - 50, y - 10, `${streak.current} Day Streak`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0, 0.5);

    this.add.text(x - 50, y + 12, `Best: ${streak.longest} days`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '14px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0, 0.5);

    if (isCompleted) {
      const checkmark = this.add.text(x + 90, y, '✓', {
        fontFamily: UI.FONT_FAMILY_DISPLAY,
        fontSize: '28px',
        fontStyle: 'bold',
        color: colorToHex(COLORS.SAGE),
      }).setOrigin(0.5);

      Effects.popIn(checkmark);
    }

    Effects.popIn(panel);
  }

  private createRewardsPreview(x: number, y: number): void {
    const rewards = StateManager.getDailyRewards();

    this.add.text(x, y, 'REWARD PREVIEW', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.GRAPHITE),
      letterSpacing: 2,
    }).setOrigin(0.5);

    const panel = this.add.rectangle(x, y + 45, 280, 80, COLORS.MUSTARD, 0.15);
    panel.setStrokeStyle(2, COLORS.MUSTARD);

    this.add.image(x - 80, y + 45, 'coin').setScale(0.8);

    this.add.text(x - 50, y + 35, `+${rewards.total}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.MUSTARD),
    }).setOrigin(0, 0.5);

    this.add.text(x + 20, y + 45, `Base: ${rewards.base}\nStreak: +${rewards.streak}\nBonus: +${rewards.modifier}%`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '12px',
      color: colorToHex(COLORS.GRAPHITE),
      lineSpacing: 2,
    }).setOrigin(0, 0.5);

    Effects.popIn(panel);
  }

  private createPlayButton(x: number, y: number): void {
    const isCompleted = StateManager.getTodayChallengeCompleted() || this.alreadyCompleted;
    const buttonText = isCompleted ? 'Come Back Tomorrow' : 'Play Challenge';

    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 4, 240, 60, 0x000000, 0.1);
    const bg = this.add.rectangle(0, 0, 240, 60, isCompleted ? COLORS.SAGE : COLORS.CORAL);
    bg.setStrokeStyle(3, 0xFFFFFF, 0.5);

    const label = this.add.text(0, 0, buttonText, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(240, 60);
    container.setScale(1);

    const setupInteractive = () => {
      container.setInteractive(
        new Phaser.Geom.Rectangle(-120, -30, 240, 60),
        Phaser.Geom.Rectangle.Contains
      );

      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scale: 1.05, duration: 150 });
      });

      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1, duration: 150 });
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
            InputManager.vibrate(20);
            if (!isCompleted) {
              this.startChallenge();
            }
          },
        });
      });
    };

    if (!isCompleted) {
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 300,
        onComplete: setupInteractive,
      });
    } else {
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 300,
      });
    }
  }

  private createBackButton(x: number, y: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 22, COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF);

    const icon = this.add.text(0, 0, '←', {
      fontSize: '20px',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    container.add([bg, icon]);
    container.setSize(44, 44);
    container.setScale(1);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        container.setInteractive(
          new Phaser.Geom.Circle(0, 0, 22),
          Phaser.Geom.Circle.Contains
        );

        container.on('pointerover', () => {
          this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
        });

        container.on('pointerout', () => {
          this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        container.on('pointerup', () => {
          this.scene.start('HomeScene');
        });
      },
    });
  }

  private startChallenge(): void {
    this.scene.start('GameScene', {
      levelData: this.dailyLevel,
      isDaily: true,
    });
  }

  private getPuzzleIcon(type: PuzzleType): string {
    const icons: Record<PuzzleType, string> = {
      [PuzzleType.SORT]: '🗂',
      [PuzzleType.UNTANGLE]: '🧩',
      [PuzzleType.PACK]: '📦',
    };
    return icons[type] || '🎮';
  }

  private getModifierColor(type: DailyModifierType): number {
    const colors: Record<DailyModifierType, number> = {
      [DailyModifierType.SPEED_ROUND]: 0xF39C12,
      [DailyModifierType.PRECISION_MODE]: 0xE74C3C,
      [DailyModifierType.BONUS_COINS]: 0x27AE60,
    };
    return colors[type] || COLORS.SAGE;
  }

  shutdown(): void {
    // Clean up modifier tweens to prevent memory leaks
    for (const tween of this.modifierTweens) {
      if (tween && tween.isPlaying()) {
        tween.stop();
      }
    }
    this.modifierTweens = [];
  }
}
