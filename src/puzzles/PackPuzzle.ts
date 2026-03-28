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
  placed: boolean;
  placedX: number;
  placedY: number;
}

export class PackPuzzle extends BasePuzzle {
  private bounds!: Rectangle;
  private boundsGraphics!: Phaser.GameObjects.Rectangle;
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
    
    this.boundsGraphics = this.scene.add.rectangle(
      this.bounds.x + this.bounds.width / 2,
      this.bounds.y + this.bounds.height / 2,
      this.bounds.width,
      this.bounds.height,
      boundsColor,
      0.15
    );
    this.boundsGraphics.setStrokeStyle(3, boundsColor, 1);
    this.boundsGraphics.setData('isBounds', true);
    
    this.container.add(this.boundsGraphics);
    
    const label = this.scene.add.text(
      this.bounds.x + this.bounds.width / 2,
      this.bounds.y - 20,
      'Drop items here',
      {
        fontSize: '14px',
        color: '#4A90D9',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setAlpha(0.8);
    
    this.container.add(label);
    
    this.scene.tweens.add({
      targets: this.boundsGraphics,
      strokeAlpha: { from: 1, to: 0.5 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
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
      
      item.on('dragend', () => {
        this.checkItemPlacement(item, itemData);
      });
      
      this.items.push({
        data: itemData,
        graphics: item,
        placed: false,
        placedX: itemData.position.x,
        placedY: itemData.position.y,
      });
      
      this.container.add(item);
    });
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
    this.scene.tweens.add({
      targets: item,
      x: itemData.position.x,
      y: itemData.position.y,
      duration: 200,
      ease: 'Back.out',
    });
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
    this.boundsGraphics.destroy();
    this.items.forEach(item => {
      item.graphics.destroy();
    });
    this.container.destroy();
  }
}