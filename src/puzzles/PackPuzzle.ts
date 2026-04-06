import Phaser from 'phaser';
import { BasePuzzle } from './BasePuzzle';
import { LevelData, PackConfig, PackItem, Rectangle } from '@/config/types';
import { COLORS } from '@/config/colors';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

interface ItemData {
  data: PackItem;
  graphics: Phaser.GameObjects.Rectangle;
  tapeLine?: Phaser.GameObjects.Rectangle;
  placed: boolean;
  placedX: number;
  placedY: number;
}

export class PackPuzzle extends BasePuzzle {
  private bounds!: Rectangle;
  private boundsContainer!: Phaser.GameObjects.Container;
  private boundsGraphics!: Phaser.GameObjects.Rectangle;
  private ghostPreview: Phaser.GameObjects.Rectangle | null = null;
  private items: ItemData[] = [];
  private unplacedCount: number = 0;

  constructor(scene: Phaser.Scene, level: LevelData) {
    super(scene, level);
  }

  init(): void {
    const config = this.level.config as PackConfig;
    this.bounds = config.bounds;

    this.createBounds();
    this.createItems(config.items);
    this.unplacedCount = config.items.length;

    this.startTimer();
  }

  private createBounds(): void {
    const boundsColor = COLORS.SKY;
    const cx = this.bounds.x + this.bounds.width / 2;
    const cy = this.bounds.y + this.bounds.height / 2;

    this.boundsContainer = this.scene.add.container(0, 0);

    // Shadow
    const shadow = this.scene.add.rectangle(cx + 3, cy + 5, this.bounds.width, this.bounds.height, 0x000000, 0.06);
    this.boundsContainer.add(shadow);

    // Main bounds area
    this.boundsGraphics = this.scene.add.rectangle(
      cx, cy,
      this.bounds.width,
      this.bounds.height,
      boundsColor,
      0.1
    );
    this.boundsGraphics.setStrokeStyle(3, boundsColor, 1);
    this.boundsGraphics.setData('isBounds', true);
    this.boundsContainer.add(this.boundsGraphics);

    // Dashed grid inside
    const gridGraphics = this.scene.add.graphics();
    gridGraphics.lineStyle(1, boundsColor, 0.12);
    const gridSize = 30;
    for (let gx = this.bounds.x + gridSize; gx < this.bounds.x + this.bounds.width; gx += gridSize) {
      gridGraphics.lineBetween(gx, this.bounds.y, gx, this.bounds.y + this.bounds.height);
    }
    for (let gy = this.bounds.y + gridSize; gy < this.bounds.y + this.bounds.height; gy += gridSize) {
      gridGraphics.lineBetween(this.bounds.x, gy, this.bounds.x + this.bounds.width, gy);
    }
    this.boundsContainer.add(gridGraphics);

    // Corner brackets
    const bracketLen = 15;
    const bracketGraphics = this.scene.add.graphics();
    bracketGraphics.lineStyle(3, boundsColor, 0.6);
    const corners = [
      { x: this.bounds.x, y: this.bounds.y, dx: 1, dy: 1 },
      { x: this.bounds.x + this.bounds.width, y: this.bounds.y, dx: -1, dy: 1 },
      { x: this.bounds.x, y: this.bounds.y + this.bounds.height, dx: 1, dy: -1 },
      { x: this.bounds.x + this.bounds.width, y: this.bounds.y + this.bounds.height, dx: -1, dy: -1 },
    ];
    corners.forEach(c => {
      bracketGraphics.lineBetween(c.x, c.y, c.x + bracketLen * c.dx, c.y);
      bracketGraphics.lineBetween(c.x, c.y, c.x, c.y + bracketLen * c.dy);
    });
    this.boundsContainer.add(bracketGraphics);

    // Label
    const label = this.scene.add.text(
      cx,
      this.bounds.y - 20,
      'Pack items here',
      {
        fontSize: '14px',
        color: '#4A90D9',
        fontFamily: 'Fredoka',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setAlpha(0.8);
    this.boundsContainer.add(label);

    // Pulsing border animation
    this.scene.tweens.add({
      targets: this.boundsGraphics,
      strokeAlpha: { from: 1, to: 0.5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Ghost preview rectangle (hidden initially)
    this.ghostPreview = this.scene.add.rectangle(0, 0, 10, 10, 0x000000, 0);
    this.ghostPreview.setStrokeStyle(2, COLORS.SUCCESS, 0);
    this.ghostPreview.setVisible(false);
    this.boundsContainer.add(this.ghostPreview);

    this.container.add(this.boundsContainer);
  }

  private createItems(items: PackItem[]): void {
    items.forEach((itemData) => {
      const item = this.createDraggableObject(
        itemData.position.x,
        itemData.position.y,
        itemData.width,
        itemData.height,
        itemData.color,
        itemData.id
      );

      item.setData('width', itemData.width);
      item.setData('height', itemData.height);

      // Tape line detail across the middle
      const tapeLine = this.scene.add.rectangle(
        itemData.position.x,
        itemData.position.y,
        itemData.width * 0.7,
        4,
        0xFFFFFF,
        0.2
      );

      // Sync tape line during drag
      item.on('drag', () => {
        tapeLine.x = item.x;
        tapeLine.y = item.y;
        this.updateGhostPreview(item, itemData);
      });

      item.on('dragstart', () => {
        tapeLine.x = item.x;
        tapeLine.y = item.y;
        if (this.ghostPreview) this.ghostPreview.setVisible(true);
      });

      item.on('dragend', () => {
        if (this.ghostPreview) this.ghostPreview.setVisible(false);
        this.checkItemPlacement(item, itemData);
      });

      this.items.push({
        data: itemData,
        graphics: item,
        tapeLine,
        placed: false,
        placedX: itemData.position.x,
        placedY: itemData.position.y,
      });

      this.container.add([item, tapeLine]);
    });
  }

  private updateGhostPreview(item: Phaser.GameObjects.Rectangle, itemData: PackItem): void {
    if (!this.ghostPreview) return;

    const boundsRect = new Phaser.Geom.Rectangle(
      this.bounds.x, this.bounds.y,
      this.bounds.width, this.bounds.height
    );

    const itemRect = new Phaser.Geom.Rectangle(
      item.x - itemData.width / 2,
      item.y - itemData.height / 2,
      itemData.width,
      itemData.height
    );

    const isInBounds = Phaser.Geom.Rectangle.ContainsRect(boundsRect, itemRect);
    const hasCollision = isInBounds && this.checkCollisionWithOtherItems(item, itemData);

    this.ghostPreview.setPosition(item.x, item.y);
    this.ghostPreview.setSize(itemData.width, itemData.height);

    if (isInBounds) {
      const color = hasCollision ? COLORS.ERROR : COLORS.SUCCESS;
      this.ghostPreview.setStrokeStyle(2, color, 0.5);
      this.ghostPreview.setFillStyle(color, 0.08);
    } else {
      this.ghostPreview.setStrokeStyle(2, 0x000000, 0);
      this.ghostPreview.setFillStyle(0x000000, 0);
    }
  }

  private checkItemPlacement(item: Phaser.GameObjects.Rectangle, itemData: PackItem): void {
    const itemWidth = itemData.width;
    const itemHeight = itemData.height;
    const itemX = item.x - itemWidth / 2;
    const itemY = item.y - itemHeight / 2;

    const boundsRect = new Phaser.Geom.Rectangle(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );

    const itemRect = new Phaser.Geom.Rectangle(itemX, itemY, itemWidth, itemHeight);

    if (Phaser.Geom.Rectangle.ContainsRect(boundsRect, itemRect)) {
      if (!this.checkCollisionWithOtherItems(item, itemData)) {
        this.placeItem(item, itemData);
        return;
      }
    }

    this.returnItem(item, itemData);
  }

  private checkCollisionWithOtherItems(
    currentItem: Phaser.GameObjects.Rectangle,
    currentItemData: PackItem
  ): boolean {
    const currentRect = new Phaser.Geom.Rectangle(
      currentItem.x - currentItemData.width / 2,
      currentItem.y - currentItemData.height / 2,
      currentItemData.width,
      currentItemData.height
    );

    for (const item of this.items) {
      if (item.data.id === currentItemData.id || !item.placed) continue;

      const itemRect = new Phaser.Geom.Rectangle(
        item.placedX - item.data.width / 2,
        item.placedY - item.data.height / 2,
        item.data.width,
        item.data.height
      );

      if (Phaser.Geom.Rectangle.Overlaps(currentRect, itemRect)) {
        return true;
      }
    }

    return false;
  }

  private placeItem(item: Phaser.GameObjects.Rectangle, itemData: PackItem): void {
    const itemObj = this.items.find(i => i.data.id === itemData.id);
    if (!itemObj || itemObj.placed) return;

    itemObj.placed = true;
    itemObj.placedX = item.x;
    itemObj.placedY = item.y;
    this.unplacedCount--;

    this.scene.tweens.add({
      targets: item,
      scale: 1,
      duration: 100,
      ease: 'Back.out',
    });

    item.setStrokeStyle(3, COLORS.SUCCESS, 1);

    // Sync tape line position
    if (itemObj.tapeLine) {
      itemObj.tapeLine.x = item.x;
      itemObj.tapeLine.y = item.y;
    }

    Effects.particles(item.x, item.y, { color: itemData.color, count: 12, speed: 180 });
    Effects.sparkle(item.x, item.y, 2);
    AudioManager.playSound('snap');
    InputManager.vibrate(20);

    this.recordCombo(item.x, item.y);

    if (this.unplacedCount === 0) {
      this.isComplete = true;
      this.stopTimer();
      this.onWin();
    }
  }

  private returnItem(item: Phaser.GameObjects.Rectangle, itemData: PackItem): void {
    const itemObj = this.items.find(i => i.data.id === itemData.id);

    this.scene.tweens.add({
      targets: item,
      x: itemData.position.x,
      y: itemData.position.y,
      duration: 200,
      ease: 'Back.out',
    });

    if (itemObj?.tapeLine) {
      this.scene.tweens.add({
        targets: itemObj.tapeLine,
        x: itemData.position.x,
        y: itemData.position.y,
        duration: 200,
        ease: 'Back.out',
      });
    }
  }

  private onWin(): void {
    const centerX = this.bounds.x + this.bounds.width / 2;
    const centerY = this.bounds.y + this.bounds.height / 2;

    Effects.confetti(centerX, centerY, 20);

    if (this.wrongMoves === 0) {
      Effects.perfect(centerX, centerY);
      AudioManager.playSound('perfect');
    } else {
      AudioManager.playSound('success');
    }
    InputManager.vibrate(40);
  }

  update(_delta: number): void {
  }

  checkWin(): boolean {
    return this.isComplete;
  }

  getProgress(): { placed: number; total: number } {
    return {
      placed: this.items.filter(i => i.placed).length,
      total: this.items.length,
    };
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.boundsGraphics);
    if (this.ghostPreview) this.ghostPreview.destroy();
    this.boundsContainer.destroy();
    this.items.forEach(item => {
      if (item.tapeLine) item.tapeLine.destroy();
      item.graphics.destroy();
    });
    this.container.destroy();
  }
}
