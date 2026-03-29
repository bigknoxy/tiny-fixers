import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { LevelData, PuzzleType, SortConfig, UntangleConfig, PackConfig, DailyModifier, DailyModifierType } from '@/config/types';
import { getLevelById } from '@/data/levels';
import { StateManager } from '@/core/StateManager';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';
import { BasePuzzle } from '@/puzzles/BasePuzzle';
import { SortPuzzle } from '@/puzzles/SortPuzzle';
import { UntanglePuzzle } from '@/puzzles/UntanglePuzzle';
import { PackPuzzle } from '@/puzzles/PackPuzzle';
import { getTypeColor } from '@/utils/puzzle';
import { TutorialModal } from '@/systems/TutorialModal';
import { isFirstLevelOfPuzzleType, getPuzzleTypeByFirstLevel } from '@/data/puzzleTutorials';
import { getEffectiveTimeLimit } from '@/config/daily';

interface GameSceneData {
  levelId?: string;
  levelData?: LevelData;
  isDaily?: boolean;
  isEndless?: boolean;
  endlessScore?: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private puzzle!: BasePuzzle;
  private isDaily: boolean = false;
  private isEndless: boolean = false;
  private endlessScore: number = 0;
  private dailyModifiers: DailyModifier[] = [];
  private precisionModeFailed: boolean = false;

  private timeRemaining!: number;
  private timerText!: Phaser.GameObjects.Text;
  private timerCircle!: Phaser.GameObjects.Arc;
  private progressText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private timerEvent!: Phaser.Time.TimerEvent;

  private isPaused: boolean = false;
  private isComplete: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    // Check for daily challenge replay - prevent playing if already completed today
    if (data.isDaily && StateManager.getTodayChallengeCompleted()) {
      console.warn('Daily challenge already completed today, redirecting...');
      this.scene.start('DailyChallengeScene', { alreadyCompleted: true });
      return;
    }

    if (data.levelData) {
      this.level = data.levelData;
    } else if (data.levelId) {
      const levelData = getLevelById(data.levelId);
      if (!levelData) {
        console.error(`Level not found: ${data.levelId}`);
        this.scene.start('HomeScene');
        return;
      }
      this.level = levelData;
    } else {
      console.error('No level data provided');
      this.scene.start('HomeScene');
      return;
    }

    this.isDaily = data.isDaily || false;
    this.isEndless = data.isEndless || false;
    this.endlessScore = data.endlessScore || 0;
    this.dailyModifiers = data.levelData?.modifiers ?? [];
    this.precisionModeFailed = false;
    this.isPaused = false;
    this.isComplete = false;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.createBackground(width, height);

    // HUD
    this.createHUD(centerX);

    // Puzzle
    this.createPuzzle();

    // Timer
    this.startTimer();

    InputManager.setEnabled(true);

    // Show tutorial for first-time puzzle type
    this.checkAndShowPuzzleTutorial();
  }

  private checkAndShowPuzzleTutorial(): void {
    const isFirstLevel = isFirstLevelOfPuzzleType(this.level.id);
    if (!isFirstLevel) return;

    const puzzleType = getPuzzleTypeByFirstLevel(this.level.id);
    if (!puzzleType) return;

    if (StateManager.isPuzzleTypeTutorialSeen(puzzleType)) return;

    this.isPaused = true;
    
    try {
      TutorialModal.show(this, puzzleType, () => {
        StateManager.markPuzzleTypeTutorialSeen(puzzleType);
        this.isPaused = false;
      });
    } catch (error) {
      console.error('Failed to show puzzle tutorial:', error);
      this.isPaused = false;
    }
  }
  
  private createBackground(width: number, height: number): void {
    // Base color based on puzzle type
    let bgColor = COLORS.CREAM;
    
    switch (this.level.type) {
      case PuzzleType.SORT:
        bgColor = 0xFFF5F3; // Light coral tint
        break;
      case PuzzleType.UNTANGLE:
        bgColor = 0xF3FAF6; // Light sage tint
        break;
      case PuzzleType.PACK:
        bgColor = 0xF3F8FC; // Light sky tint
        break;
    }
    
    this.add.rectangle(width / 2, height / 2, width, height, bgColor);
    
    // Subtle pattern
    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.3);
  }

  private createHUD(x: number): void {
    const safeTop = UI.SAFE_AREA_TOP + 15;

    // Level name badge
    const typeColor = getTypeColor(this.level.type);
    const nameBg = this.add.rectangle(x, safeTop + 15, 180, 32, typeColor, 0.9);
    nameBg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    
    const levelName = this.isDaily ? `Daily: ${this.level.name}` : this.level.name;
    this.add.text(x, safeTop + 15, levelName, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Timer display - apply time multiplier if speed round is active
    const config = this.level.config as SortConfig | UntangleConfig | PackConfig;
    const baseTime = config.timeLimit;
    this.timeRemaining = getEffectiveTimeLimit(baseTime, this.dailyModifiers);

    // Show precision mode warning if active
    const hasPrecisionMode = this.dailyModifiers.some(m => m.type === DailyModifierType.PRECISION_MODE);
    if (hasPrecisionMode) {
      const warningBg = this.add.rectangle(x, safeTop + 110, 200, 28, COLORS.CORAL, 0.9);
      warningBg.setStrokeStyle(2, 0xFFFFFF);
      this.add.text(x, safeTop + 110, '🎯 No mistakes allowed!', {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
      }).setOrigin(0.5);
    }

    const timerY = safeTop + 70;
    
    // Timer circle background
    this.timerCircle = this.add.circle(x, timerY, 28, COLORS.WARM_WHITE);
    this.timerCircle.setStrokeStyle(3, typeColor);
    
    this.timerText = this.add.text(x, timerY, this.formatTime(this.timeRemaining), {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    // Progress bar
    const progressY = safeTop + 120;
    const progressWidth = 200;
    
    const progressBg = this.add.rectangle(x, progressY, progressWidth, 8, 0xE0E0E0);
    progressBg.setStrokeStyle(1, 0xFFFFFF, 0.5);
    
    this.progressFill = this.add.rectangle(x - progressWidth / 2, progressY, 0, 6, typeColor);
    this.progressFill.setOrigin(0, 0.5);
    
    this.progressText = this.add.text(x, progressY + 20, '', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '14px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    // Pause button
    this.createPauseButton(40, safeTop + 15);

    // Update progress text
    this.updateProgressText();
  }

  private createPauseButton(x: number, y: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 22, COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);
    
    const icon = this.add.text(0, 0, '⏸', {
      fontSize: '18px',
    }).setOrigin(0.5);

    container.add([bg, icon]);
    
    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 22),
      Phaser.Geom.Circle.Contains
    );

    container.on('pointerover', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 1);
      this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
    });
    
    container.on('pointerout', () => {
      bg.setFillStyle(COLORS.WARM_WHITE, 0.9);
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
        ease: 'Back.out',
        onComplete: () => this.togglePause()
      });
    });
  }

  private createPuzzle(): void {
    switch (this.level.type) {
      case PuzzleType.SORT:
        this.puzzle = new SortPuzzle(this, this.level);
        break;
      case PuzzleType.UNTANGLE:
        this.puzzle = new UntanglePuzzle(this, this.level);
        break;
      case PuzzleType.PACK:
        this.puzzle = new PackPuzzle(this, this.level);
        break;
      default:
        console.error(`Unknown puzzle type: ${this.level.type}`);
        this.scene.start('HomeScene');
        return;
    }

    this.puzzle.init();
  }

  private startTimer(): void {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.isPaused || this.isComplete) return;

        this.timeRemaining--;
        this.timerText.setText(this.formatTime(this.timeRemaining));

        if (this.timeRemaining <= 10) {
          this.timerText.setColor(colorToHex(COLORS.CORAL));
          this.tweens.add({
            targets: this.timerCircle,
            scale: 1.1,
            duration: 100,
            yoyo: true,
          });
          
          if (this.timeRemaining <= 5) {
            Effects.timeWarning(this, this.scale.width / 2, this.scale.height / 2);
            AudioManager.playSound('tick');
            InputManager.vibrate(15);
          }
        }

        if (this.timeRemaining <= 0) {
          this.timeUp();
        }
      },
      loop: true,
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private updateProgressText(): void {
    if (!this.puzzle) return;
    
    let progress = '';
    let ratio = 0;
    const p = this.puzzle.getProgress();

    if (this.puzzle instanceof SortPuzzle) {
      progress = `${p.placed} / ${p.total} sorted`;
    } else if (this.puzzle instanceof UntanglePuzzle) {
      progress = `${p.placed} / ${p.total} separated`;
    } else if (this.puzzle instanceof PackPuzzle) {
      progress = `${p.placed} / ${p.total} packed`;
    }
    
    ratio = p.total > 0 ? p.placed / p.total : 0;

    this.progressText.setText(progress);
    
    // Animate progress bar
    this.tweens.add({
      targets: this.progressFill,
      width: 200 * ratio,
      duration: 200,
      ease: ANIMATIONS.SMOOTH_EASE,
    });
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showPauseMenu();
    }
  }

  private showPauseMenu(): void {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

    const menu = this.add.container(width / 2, height / 2);

    const panelBg = this.add.rectangle(0, 0, 300, 260, COLORS.WARM_WHITE);
    panelBg.setStrokeStyle(3, COLORS.CORAL, 0.5);
    
    const title = this.add.text(0, -90, 'Paused', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    const resumeBtn = this.createMenuButton(0, -25, 'Resume', COLORS.SAGE, () => {
      menu.destroy();
      overlay.destroy();
      this.isPaused = false;
    });

    const restartBtn = this.createMenuButton(0, 35, 'Restart', COLORS.SKY, () => {
      if (this.isEndless) {
        this.scene.start('EndlessScene');
      } else {
        this.scene.restart({ levelId: this.level.id, isDaily: this.isDaily });
      }
    });

    const quitBtn = this.createMenuButton(0, 95, 'Quit', COLORS.CORAL, () => {
      if (this.isEndless) {
        this.scene.start('HomeScene');
      } else {
        this.scene.start('LevelSelectScene');
      }
    });

    menu.add([panelBg, title, resumeBtn, restartBtn, quitBtn]);

    Effects.popIn(menu);
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 3, 220, 48, 0x000000, 0.1);
    const bg = this.add.rectangle(0, 0, 220, 48, color);
    bg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(220, 48);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.03, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerup', callback);

    return container;
  }

  private timeUp(): void {
    this.isComplete = true;
    this.showResults(false);
  }

  private levelComplete(): void {
    if (this.isComplete) return;
    
    this.isComplete = true;
    this.showResults(true);
  }

  private showResults(success: boolean): void {
    const score = this.puzzle.getScore();

    if (this.isEndless) {
      const newScore = this.endlessScore + (success ? 1 : 0);
      
      if (success) {
        const isNewHighScore = StateManager.updateEndlessHighScore(newScore);
        
        if (isNewHighScore && newScore > 1) {
          this.scene.start('EndlessScene', { score: newScore, showHighScore: true });
          return;
        }
        
        this.scene.start('EndlessScene', { score: newScore, levelCompleted: true });
      } else {
        this.scene.start('EndlessScene', { score: this.endlessScore, levelCompleted: false });
      }
      return;
    }

    if (success) {
      StateManager.completeLevel(this.level.id, score.stars, score.time);
      StateManager.addCoins(score.coins);
      StateManager.recordCoinsEarned(score.coins);

      const wasPerfect = this.puzzle.getScore().accuracy === 1;
      StateManager.recordGamePlayed(this.level.type, wasPerfect);

      if (this.isDaily) {
        const { coins: dailyCoins } = StateManager.completeDailyChallengeWithRewards(
          score.time,
          this.dailyModifiers,
          wasPerfect
        );
        // Use daily rewards instead of regular
        score.coins = dailyCoins;
      }

      score.materials.forEach((m) => {
        if (m) {
          StateManager.addMaterial(m.type, m.amount);
        }
      });
    }

    this.scene.start('ResultsScene', {
      success,
      levelId: this.level.id,
      stars: score.stars,
      time: score.time,
      coins: score.coins,
      materials: score.materials,
      isDaily: this.isDaily,
      dailyModifiers: this.dailyModifiers,
      wasPrecisionPerfect: this.isDaily && !this.precisionModeFailed && this.hasPrecisionMode(),
    });
  }

  update(_time: number, delta: number): void {
    if (this.isPaused || this.isComplete) return;

    if (this.puzzle) {
      this.puzzle.update(delta);

      this.updateProgressText();

      // Check for precision mode failure
      if (this.isDaily && this.hasPrecisionMode() && this.puzzle.getWrongMoves() > 0 && !this.precisionModeFailed) {
        this.precisionModeFailed = true;
        this.failPrecisionMode();
        return;
      }

      if (this.puzzle.checkWin()) {
        this.levelComplete();
      }
    }
  }

  private hasPrecisionMode(): boolean {
    return this.dailyModifiers.some(m => m.type === DailyModifierType.PRECISION_MODE);
  }

  private failPrecisionMode(): void {
    this.isComplete = true;
    this.showResults(false);
  }

  shutdown(): void {
    // Clean up timer event
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = null as unknown as Phaser.Time.TimerEvent;
    }

    if (this.puzzle) {
      this.puzzle.destroy();
    }
  }
}