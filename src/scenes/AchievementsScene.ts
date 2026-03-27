import Phaser from 'phaser';
import { COLORS, colorToHex } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { StateManager } from '@/core/StateManager';
import { AudioManager } from '@/systems/AudioManager';
import { Effects } from '@/systems/Effects';
import { ACHIEVEMENT_DEFINITIONS, AchievementCategory } from '@/data/achievements';

const CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'progression', label: 'Progress', icon: '📊' },
  { id: 'skill', label: 'Skill', icon: '⭐' },
  { id: 'dedication', label: 'Dedication', icon: '🔥' },
  { id: 'challenge', label: 'Challenge', icon: '🎯' },
  { id: 'collection', label: 'Collection', icon: '🏆' },
];

export class AchievementsScene extends Phaser.Scene {
  private selectedCategory: AchievementCategory = 'progression';
  private contentContainer!: Phaser.GameObjects.Container;
  private categoryButtons: Phaser.GameObjects.Container[] = [];
  private scrollY: number = 0;
  private maxScrollY: number = 0;

  constructor() {
    super({ key: 'AchievementsScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const safeTop = UI.SAFE_AREA_TOP + 20;

    Effects.init(this);

    this.createBackground(width, height);
    this.createHeader(centerX, safeTop);
    this.createCategoryTabs(centerX, safeTop + 80);
    this.createContentArea(centerX, safeTop + 140, height);

    this.updateContent();
  }

  private createBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.CREAM);

    const pattern = this.add.tileSprite(width / 2, height / 2, width, height, 'bg_pattern');
    pattern.setAlpha(0.3);

    const topDeco = this.add.graphics();
    topDeco.fillStyle(COLORS.SOFT_PEACH, 0.5);
    topDeco.beginPath();
    topDeco.moveTo(0, 0);
    topDeco.lineTo(width, 0);
    topDeco.lineTo(width, 100);
    topDeco.lineTo(width / 2, 130);
    topDeco.lineTo(0, 100);
    topDeco.closePath();
    topDeco.fillPath();
  }

  private createHeader(x: number, y: number): void {
    const container = this.add.container(x, y);

    const backButton = this.createBackButton(-150, 0);

    const title = this.add.text(0, 0, 'Achievements', {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: colorToHex(COLORS.CORAL),
    }).setOrigin(0.5);
    title.setShadow(0, 2, colorToHex(COLORS.CORAL_DARK), 0, true, false);

    const progress = StateManager.getAchievementProgress();
    const progressText = this.add.text(120, 0, `${progress.unlocked}/${progress.total}`, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '18px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    container.add([backButton, title, progressText]);
  }

  private createBackButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 20, COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, 0xFFFFFF, 1);

    const arrow = this.add.text(0, 0, '←', {
      fontSize: '24px',
      color: colorToHex(COLORS.CHARCOAL),
    }).setOrigin(0.5);

    container.add([bg, arrow]);

    container.setInteractive(
      new Phaser.Geom.Circle(0, 0, 20),
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

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      this.scene.start('HomeScene');
    });

    return container;
  }

  private createCategoryTabs(x: number, y: number): void {
    const container = this.add.container(x, y);
    const tabWidth = 60;
    const spacing = 8;
    const totalWidth = CATEGORIES.length * tabWidth + (CATEGORIES.length - 1) * spacing;
    const startX = -totalWidth / 2 + tabWidth / 2;

    CATEGORIES.forEach((cat, index) => {
      const tabX = startX + index * (tabWidth + spacing);
      const tab = this.createCategoryTab(tabX, 0, cat);
      this.categoryButtons.push(tab);
      container.add(tab);
    });
  }

  private createCategoryTab(
    x: number,
    y: number,
    category: typeof CATEGORIES[0]
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const isSelected = this.selectedCategory === category.id;

    const bg = this.add.rectangle(0, 0, 60, 44, isSelected ? COLORS.CORAL : COLORS.WARM_WHITE, 0.9);
    bg.setStrokeStyle(2, isSelected ? COLORS.CORAL : COLORS.GRAPHITE, 0.3);

    const icon = this.add.text(0, -5, category.icon, {
      fontSize: '18px',
    }).setOrigin(0.5);

    const label = this.add.text(0, 12, category.label, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '9px',
      color: isSelected ? '#FFFFFF' : colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0.5);

    container.add([bg, icon, label]);
    container.setSize(60, 44);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      if (this.selectedCategory !== category.id) {
        bg.setFillStyle(COLORS.WARM_WHITE, 1);
        this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
      }
    });

    container.on('pointerout', () => {
      if (this.selectedCategory !== category.id) {
        bg.setFillStyle(COLORS.WARM_WHITE, 0.9);
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
      }
    });

    container.on('pointerup', () => {
      AudioManager.playSound('click');
      this.selectCategory(category.id);
    });

    return container;
  }

  private selectCategory(category: AchievementCategory): void {
    if (this.selectedCategory === category) return;

    this.selectedCategory = category;
    this.scrollY = 0;

    this.categoryButtons.forEach((btn, index) => {
      const cat = CATEGORIES[index];
      const isSelected = cat.id === category;
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      const label = btn.getAt(2) as Phaser.GameObjects.Text;

      bg.setFillStyle(isSelected ? COLORS.CORAL : COLORS.WARM_WHITE, 0.9);
      bg.setStrokeStyle(2, isSelected ? COLORS.CORAL : COLORS.GRAPHITE, 0.3);
      label.setColor(isSelected ? '#FFFFFF' : colorToHex(COLORS.GRAPHITE));
    });

    this.updateContent();
  }

  private createContentArea(x: number, y: number, height: number): void {
    this.contentContainer = this.add.container(x, y);

    const maskShape = this.add.rectangle(x, y + (height - y - 100) / 2, 350, height - y - 100, 0x000000, 0);
    const mask = maskShape.createGeometryMask();
    this.contentContainer.setMask(mask);
    maskShape.destroy();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.maxScrollY > 0) {
        const delta = pointer.velocity.y * 0.016;
        this.scrollY = Phaser.Math.Clamp(this.scrollY - delta, 0, this.maxScrollY);
        this.contentContainer.setY(y - this.scrollY);
      }
    });
  }

  private updateContent(): void {
    this.contentContainer.removeAll(true);

    const achievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.category === this.selectedCategory);
    const cardHeight = 90;
    const spacing = 10;

    achievements.forEach((def, index) => {
      const achievement = StateManager.getAchievement(def.id);
      const isUnlocked = achievement?.unlocked ?? false;

      const card = this.createAchievementCard(
        0,
        index * (cardHeight + spacing),
        def,
        isUnlocked,
        achievement?.unlockedAt ?? null
      );

      this.contentContainer.add(card);
    });

    const totalHeight = achievements.length * (cardHeight + spacing) - spacing;
    this.maxScrollY = Math.max(0, totalHeight - 400);
    this.scrollY = 0;
    this.contentContainer.setY(UI.SAFE_AREA_TOP + 140);
  }

  private createAchievementCard(
    x: number,
    y: number,
    def: typeof ACHIEVEMENT_DEFINITIONS[0],
    isUnlocked: boolean,
    unlockedAt: number | null
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const cardWidth = 340;
    const cardHeight = 85;

    const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, isUnlocked ? COLORS.WARM_WHITE : COLORS.GRAY, 0.3);
    bg.setStrokeStyle(2, isUnlocked ? COLORS.SAGE : COLORS.GRAPHITE, 0.5);

    const icon = this.add.text(-140, -15, def.icon, {
      fontSize: isUnlocked ? '32px' : '24px',
    }).setOrigin(0.5);
    icon.setAlpha(isUnlocked ? 1 : 0.5);

    const name = this.add.text(-105, -25, def.name, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: isUnlocked ? colorToHex(COLORS.CHARCOAL) : colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0, 0.5);
    name.setAlpha(isUnlocked ? 1 : 0.6);

    const desc = this.add.text(-105, 0, def.description, {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '13px',
      color: colorToHex(COLORS.GRAPHITE),
    }).setOrigin(0, 0.5);
    desc.setAlpha(isUnlocked ? 1 : 0.6);

    const rewardBg = this.add.rectangle(120, -15, 70, 28, isUnlocked ? COLORS.MUSTARD : COLORS.GRAY, 0.8);
    rewardBg.setStrokeStyle(1, 0xFFFFFF, 0.3);

    const rewardText = this.add.text(120, -15, `+${def.reward}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    if (isUnlocked && unlockedAt) {
      const date = new Date(unlockedAt);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      const unlockedText = this.add.text(120, 15, `✓ ${dateStr}`, {
        fontFamily: UI.FONT_FAMILY_BODY,
        fontSize: '11px',
        color: colorToHex(COLORS.SAGE),
      }).setOrigin(0.5);
      container.add(unlockedText);
    }

    container.add([bg, icon, name, desc, rewardBg, rewardText]);

    if (isUnlocked) {
      this.tweens.add({
        targets: container,
        alpha: { from: 0, to: 1 },
        y: { from: y + 20, to: y },
        duration: 300,
        delay: Math.random() * 100,
        ease: ANIMATIONS.SMOOTH_EASE,
      });
    }

    return container;
  }
}
