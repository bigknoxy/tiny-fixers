import Phaser from 'phaser';
import { BasePuzzle } from './BasePuzzle';
import { LevelData, SortConfig, SortBin, SortItem } from '@/config/types';
import { COLORS } from '@/config/colors';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

interface BinObject {
  data: SortBin;
  graphics: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface ItemObject {
  data: SortItem;
  graphics: Phaser.GameObjects.Arc;
  placed: boolean;
}

export class SortPuzzle extends BasePuzzle {
  private bins: BinObject[] = [];
  private items: ItemObject[] = [];
  private unplacedCount: number = 0;

  constructor(scene: Phaser.Scene, level: LevelData) {
    super(scene, level);
  }

  init(): void {
    const config = this.level.config as SortConfig;
    
    this.createBins(config.bins);
    this.createItems(config.items);
    this.unplacedCount = config.items.length;
    
    this.startTimer();
  }

  private createBins(bins: SortBin[]): void {
    const sceneWidth = this.scene.scale.width;
    const margin = 12;
    const availableWidth = sceneWidth - margin * 2;
    const originalBinWidth = bins[0].size.x;
    const binHeight = bins[0].size.y;
    const binY = bins[0].position.y;
    const minSpacing = 6;

    let spacing = 20;
    let binWidth = originalBinWidth;
    let totalWidth = bins.length * binWidth + (bins.length - 1) * spacing;

    if (totalWidth > availableWidth) {
      spacing = minSpacing;
      totalWidth = bins.length * binWidth + (bins.length - 1) * spacing;
      
      if (totalWidth > availableWidth) {
        const scale = availableWidth / totalWidth;
        binWidth = Math.floor(originalBinWidth * scale);
        totalWidth = bins.length * binWidth + (bins.length - 1) * spacing;
      }
    }

    const startX = (sceneWidth - totalWidth) / 2 + binWidth / 2;

    bins.forEach((binData, i) => {
      const finalX = startX + i * (binWidth + spacing);

      const bin = this.scene.add.rectangle(
        finalX,
        binY,
        binWidth,
        binHeight,
        binData.color,
        0.3
      );
      bin.setStrokeStyle(3, binData.color, 1);

      const label = this.scene.add.text(
        finalX,
        binY + binHeight / 2 + 15,
        binData.acceptedTypes[0].toUpperCase(),
        {
          fontSize: '14px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);

      const adjustedBinData = { ...binData, position: { x: finalX, y: binY } };

      this.bins.push({
        data: adjustedBinData,
        graphics: bin,
        label,
      });

      this.container.add([bin, label]);
    });
  }

  private createItems(items: SortItem[]): void {
    items.forEach((itemData) => {
      const item = this.createDraggableCircle(
        itemData.position.x,
        itemData.position.y,
        itemData.size,
        itemData.color,
        itemData.id
      );
      
      item.setData('type', itemData.type);
      
      item.on('dragend', () => {
        this.checkItemPlacement(item, itemData);
      });
      
      this.items.push({
        data: itemData,
        graphics: item,
        placed: false,
      });
      
      this.container.add(item);
    });
  }

  private checkItemPlacement(item: Phaser.GameObjects.Arc, itemData: SortItem): void {
    const itemBounds = item.getBounds();
    
    for (const bin of this.bins) {
      const binBounds = bin.graphics.getBounds();
      
      if (Phaser.Geom.Rectangle.Overlaps(itemBounds, binBounds)) {
        if (bin.data.acceptedTypes.includes(itemData.type)) {
          this.placeItem(item, itemData, bin);
          return;
        } else {
          this.wrongMove(item, itemData);
          return;
        }
      }
    }
    
    this.returnItem(item, itemData);
  }

  private placeItem(
    item: Phaser.GameObjects.Arc,
    itemData: SortItem,
    bin: BinObject
  ): void {
    const itemObj = this.items.find(i => i.data.id === itemData.id);
    if (!itemObj || itemObj.placed) return;
    
    itemObj.placed = true;
    this.unplacedCount--;
    
    this.scene.tweens.add({
      targets: item,
      x: bin.data.position.x,
      y: bin.data.position.y - bin.data.size.y / 2 + 20,
      scale: 0.8,
      duration: 150,
      ease: 'Back.out',
    });
    
    item.disableInteractive();
    
    Effects.particles(item.x, item.y, { color: bin.data.color, count: 12, speed: 200 });
    Effects.sparkle(item.x, item.y, 3);
    Effects.ripple(item.x, item.y, bin.data.color);
    AudioManager.playSound('snap');
    InputManager.vibrate(20);
    
    this.recordCombo(item.x, item.y);
    
    bin.graphics.setFillStyle(bin.data.color, 0.5);
    this.scene.time.delayedCall(150, () => {
      bin.graphics.setFillStyle(bin.data.color, 0.3);
    });
    
    if (this.unplacedCount === 0) {
      this.isComplete = true;
      this.stopTimer();
      if (this.wrongMoves === 0) {
        Effects.perfect(item.x, item.y - 100);
        AudioManager.playSound('perfect');
      }
    }
  }

  private wrongMove(item: Phaser.GameObjects.Arc, itemData: SortItem): void {
    this.wrongMoves++;
    this.resetCombo();
    
    Effects.shake(6, 120);
    AudioManager.playSound('failure');
    InputManager.vibrate(50);
    
    item.setFillStyle(COLORS.ERROR);
    this.scene.time.delayedCall(200, () => {
      item.setFillStyle(itemData.color);
      this.returnItem(item, itemData);
    });
  }

  private returnItem(item: Phaser.GameObjects.Arc, itemData: SortItem): void {
    this.scene.tweens.add({
      targets: item,
      x: itemData.position.x,
      y: itemData.position.y,
      duration: 200,
      ease: 'Back.out',
    });
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
    this.bins.forEach(bin => {
      bin.graphics.destroy();
      bin.label.destroy();
    });
    this.items.forEach(item => {
      item.graphics.destroy();
    });
    this.container.destroy();
  }
}