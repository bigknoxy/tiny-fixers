import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { LEVELS } from '@/data/levels';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { getTypeColor } from '@/utils/puzzle';
import { TutorialModal } from '@/systems/TutorialModal';
import { isFirstLevelOfPuzzleType, getPuzzleTypeByFirstLevel } from '@/data/puzzleTutorials';

interface LevelSelectData {
  showWelcome?: boolean;
}

export class LevelSelectScene extends Phaser.Scene {
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private lastPointerY: number = 0;
  private showWelcome: boolean = false;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  init(data: LevelSelectData): void {
    this.showWelcome = data.showWelcome || false;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;
    const safeBottom = height - UI.SAFE_AREA_BOTTOM;

    console.warn(`LevelSelectScene create: ${width}x${height}, centerX=${centerX}, safeTop=${safeTop}`);

    this.createBackground(width, height);
    this.createHeader(centerX, safeTop);
    this.createLevelGrid(centerX, safeTop + 100, safeBottom - safeTop - 140);
    this.setupScrolling();

    if (this.showWelcome) {
      this.showWelcomeMessage(centerX, height);
    }
  }
  
  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.CREAM);
    
    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.4);
    
    // Top curve
    const topDeco = this.add.graphics();
    topDeco.fillStyle(COLORS.CORAL, 0.15);
    topDeco.beginPath();
    topDeco.moveTo(0, 0);
    topDeco.lineTo(width, 0);
    topDeco.lineTo(width, 80);
    topDeco.lineTo(width / 2, 120);
    topDeco.lineTo(0, 80);
    topDeco.closePath();
    topDeco.fillPath();
  }

  private createHeader(x: number, y: number): void {
    const container = this.add.container(x, y);
    
    // Back button
    const backBtn = this.createBackButton(-150, 0);
    
    // Title
    const title = this.add.text(0, 0, 'Select Level', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);
    
    // Stars display
    const starsPanel = this.add.container(130, 0);
    const starsBg = this.add.rectangle(0, 0, 70, 36, COLORS.WARM_WHITE, 0.9);
    starsBg.setStrokeStyle(2, 0xFFFFFF, 1);
    
    const starIcon = this.add.image(-15, 0, 'star_filled').setScale(0.6);
    const starsText = this.add.text(10, 0, `${StateManager.state.progress.totalStars}`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);
    
    starsPanel.add([starsBg, starIcon, starsText]);
    container.add([backBtn, title, starsPanel]);
    
    // Legend for puzzle types
    this.createLegend(x, y + 50);
  }
  
  private createLegend(x: number, y: number): void {
    const container = this.add.container(x, y);
    const spacing = 80;
    
    const types = [
      { label: 'Sort', color: COLORS.SORT_PRIMARY },
      { label: 'Untangle', color: COLORS.UNTANGLE_PRIMARY },
      { label: 'Pack', color: COLORS.PACK_PRIMARY },
    ];
    
    types.forEach((type, i) => {
      const dotX = (i - 1) * spacing;
      const dot = this.add.circle(dotX, 0, 6, type.color);
      const label = this.add.text(dotX + 15, 0, type.label, {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '12px',
        color: colorToHex(COLORS.GRAPHITE),
      }).setOrigin(0, 0.5);
      
      container.add([dot, label]);
    });
  }

  private createBackButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 22, COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);
    
    const arrow = this.add.text(0, 0, '←', {
      fontSize: '24px',
      fontFamily: UI.FONT_FAMILY_BODY,
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    container.add([bg, arrow]);
    
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
        onComplete: () => {
          AudioManager.playSound('click');
          this.scene.start('HomeScene');
        }
      });
    });

    return container;
  }

  private createLevelGrid(x: number, startY: number, height: number): void {
    const itemSize = 72;
    const padding = 12;
    const columns = 4;
    const totalWidth = columns * itemSize + (columns - 1) * padding;
    const startX = x - totalWidth / 2 + itemSize / 2;

    this.scrollContainer = this.add.container(x, startY);

    LEVELS.forEach((level, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const itemX = startX + col * (itemSize + padding) - x;
      const itemY = row * (itemSize + padding);

      this.createLevelItem(itemX, itemY, itemSize, level, index);
    });

    const totalRows = Math.ceil(LEVELS.length / columns);
    const totalHeight = totalRows * (itemSize + padding);
    this.maxScrollY = Math.max(0, totalHeight - height);
  }

  private createLevelItem(
    x: number,
    y: number,
    size: number,
    level: typeof LEVELS[0],
    index: number
  ): void {
    const container = this.add.container(x, y);
    const isUnlocked = StateManager.isLevelUnlocked(level.id, index);
    const progress = StateManager.getLevelProgress(level.id);
    const isCompleted = progress.completed;
    
    console.warn(`Level ${index + 1}: pos=(${x}, ${y}), unlocked=${isUnlocked}, id=${level.id}`);
    
    // Get puzzle type color
    const typeColor = getTypeColor(level.type);
    
    // Shadow
    const shadow = this.add.circle(0, 3, size / 2 - 4, 0x000000, 0.08);
    
    // Main circle
    const bg = this.add.circle(0, 0, size / 2 - 4, isUnlocked ? COLORS.WARM_WHITE : 0xE8E8E8);
    bg.setStrokeStyle(3, isUnlocked ? typeColor : COLORS.SOFT_GRAY, isUnlocked ? 1 : 0.5);
    
    // Top color bar
    const colorBar = this.add.rectangle(0, -size / 2 + 14, size - 16, 6, typeColor);
    
    container.add([shadow, bg, colorBar]);
    
    // Level number
    const levelNum = this.add.text(0, -6, `${index + 1}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '26px',
      fontStyle: 'bold',
      color: isUnlocked ? colorToHex(COLORS.CHARCOAL) : colorToHex(COLORS.SOFT_GRAY),
    }).setOrigin(0.5);
    
    container.add(levelNum);
    
    // Stars for completed levels
    if (isCompleted) {
      const starsContainer = this.createMiniStars(0, 16, progress.stars);
      container.add(starsContainer);
    } else if (!isUnlocked) {
      const lock = this.add.text(0, 14, '🔒', {
        fontSize: '16px',
      }).setOrigin(0.5).setAlpha(0.5);
      container.add(lock);
    }
    
    // Interactive
    if (isUnlocked) {
      container.setSize(size, size);
      container.setInteractive({ useHandCursor: true });
      
      console.warn(`Level ${index + 1} interactive area: size=${size}, hitArea=(${x},${y})`);

      container.on('pointerover', () => {
        console.warn(`Level ${index + 1} pointerover`);
        this.tweens.add({
          targets: container,
          scale: 1.08,
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
      });

      container.on('pointerup', () => {
        console.warn(`Level ${index + 1} clicked, levelId: ${level.id}`);
        AudioManager.playSound('click');
        
        const isFirstOfPuzzleType = isFirstLevelOfPuzzleType(level.id);
        const puzzleType = getPuzzleTypeByFirstLevel(level.id);
        
        if (isFirstOfPuzzleType && puzzleType && !StateManager.isPuzzleTypeTutorialSeen(puzzleType)) {
          TutorialModal.show(this, puzzleType, () => {
            StateManager.markPuzzleTypeTutorialSeen(puzzleType);
            this.scene.start('GameScene', { levelId: level.id });
          });
        } else {
          this.scene.start('GameScene', { levelId: level.id });
        }
      });
    }

    this.scrollContainer.add(container);
    
    // Staggered entrance
    container.setAlpha(0);
    container.setScale(0.5);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 300,
      delay: 100 + index * 20,
      ease: ANIMATIONS.BOUNCE_EASE,
    });
  }

  private createMiniStars(x: number, y: number, stars: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const spacing = 14;
    const startX = -spacing;

    for (let i = 0; i < 3; i++) {
      const starX = startX + i * spacing;
      const star = this.add.star(starX, 0, 5, 3, 6, i < stars ? COLORS.MUSTARD : COLORS.SOFT_GRAY);
      container.add(star);
    }

    return container;
  }

  private setupScrolling(): void {
    const DRAG_THRESHOLD = 10;
    let touchStartY = 0;
    let touchStartX = 0;
    let hasMoved = false;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      touchStartY = pointer.y;
      touchStartX = pointer.x;
      hasMoved = false;
      this.lastPointerY = pointer.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (hasMoved) {
        const deltaY = pointer.y - this.lastPointerY;
        this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY, 0, this.maxScrollY);
        this.scrollContainer.y = UI.SAFE_AREA_TOP + 150 - this.scrollY;
        this.lastPointerY = pointer.y;
        return;
      }
      
      const dx = Math.abs(pointer.x - touchStartX);
      const dy = Math.abs(pointer.y - touchStartY);
      
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        hasMoved = true;
        this.lastPointerY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      hasMoved = false;
    });
  }

  private showWelcomeMessage(x: number, height: number): void {
    const overlay = this.add.rectangle(x, height / 2, 390, height, 0x000000, 0.4);
    
    const panel = this.add.container(x, height / 2);
    
    const panelBg = this.add.rectangle(0, 0, 320, 200, COLORS.WARM_WHITE);
    panelBg.setStrokeStyle(3, COLORS.SAGE, 1);
    
    const title = this.add.text(0, -60, '🎉 Welcome!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.SAGE),
    }).setOrigin(0.5);
    
    const message = this.add.text(0, -10, 'You completed the tutorial!\nSelect a level to start playing.', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      color: colorToHex(COLORS.CHARCOAL),
      align: 'center',
    }).setOrigin(0.5);
    
    const okBtn = this.add.container(0, 60);
    const btnBg = this.add.rectangle(0, 0, 180, 50, COLORS.SAGE);
    btnBg.setStrokeStyle(2, 0xFFFFFF, 0.5);
    const btnLabel = this.add.text(0, 0, 'Let\'s Go!', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    okBtn.add([btnBg, btnLabel]);
    okBtn.setSize(180, 50);
    okBtn.setInteractive({ useHandCursor: true });
    
    okBtn.on('pointerup', () => {
      AudioManager.playSound('click');
      overlay.destroy();
      panel.destroy();
    });
    
    panel.add([panelBg, title, message, okBtn]);
    
    Effects.popIn(panel);
    AudioManager.playSound('success');
  }
}