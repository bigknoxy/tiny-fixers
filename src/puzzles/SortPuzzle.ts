import Phaser from 'phaser';
import { BasePuzzle } from './BasePuzzle';
import { LevelData, SortConfig, SortBin, SortItem } from '@/config/types';
import { COLORS } from '@/config/colors';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

interface BinObject {
  data: SortBin;
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  highlight: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  placedCount: number;
}

interface ItemObject {
  data: SortItem;
  graphics: Phaser.GameObjects.Arc;
  placed: boolean;
  floatTween?: Phaser.Tweens.Tween;
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

      const binContainer = this.scene.add.container(finalX, binY);

      // Shadow
      const shadow = this.scene.add.rectangle(2, 4, binWidth, binHeight, 0x000000, 0.08);
      shadow.setOrigin(0.5);

      // Main body with lower opacity fill
      const body = this.scene.add.rectangle(0, 0, binWidth, binHeight, binData.color, 0.2);
      body.setStrokeStyle(3, binData.color, 1);
      body.setOrigin(0.5);

      // Glass highlight strip at top
      const highlight = this.scene.add.rectangle(
        0,
        -binHeight / 2 + 8,
        binWidth - 8,
        12,
        0xFFFFFF,
        0.15
      );
      highlight.setOrigin(0.5);

      // Inner shadow at bottom
      const innerShadow = this.scene.add.rectangle(
        0,
        binHeight / 2 - 6,
        binWidth - 4,
        10,
        0x000000,
        0.06
      );
      innerShadow.setOrigin(0.5);

      // Label with background pill
      const labelBg = this.scene.add.rectangle(
        0,
        binHeight / 2 + 18,
        binWidth * 0.8,
        22,
        binData.color,
        0.7
      );
      labelBg.setOrigin(0.5);

      const label = this.scene.add.text(
        0,
        binHeight / 2 + 18,
        binData.acceptedTypes[0].toUpperCase(),
        {
          fontSize: '12px',
          color: '#FFFFFF',
          fontFamily: 'Fredoka',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5);

      binContainer.add([shadow, body, highlight, innerShadow, labelBg, label]);

      const adjustedBinData = { ...binData, position: { x: finalX, y: binY } };

      this.bins.push({
        data: adjustedBinData,
        container: binContainer,
        body,
        highlight,
        label,
        placedCount: 0,
      });

      this.container.add(binContainer);
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

      // Add highlight for gradient sphere effect
      const hlRadius = itemData.size * 0.35;
      const hlX = itemData.position.x - itemData.size * 0.25;
      const hlY = itemData.position.y - itemData.size * 0.3;
      const highlightCircle = this.scene.add.circle(hlX, hlY, hlRadius, 0xFFFFFF, 0.35);
      highlightCircle.setData('parentItem', item);

      item.setData('type', itemData.type);
      item.setData('highlight', highlightCircle);

      // Update highlight position during drag
      item.on('drag', () => {
        highlightCircle.x = item.x - itemData.size * 0.25;
        highlightCircle.y = item.y - itemData.size * 0.3;
      });

      item.on('dragstart', () => {
        // Stop idle float when picked up
        const itemObj = this.items.find(it => it.data.id === itemData.id);
        if (itemObj?.floatTween) {
          itemObj.floatTween.stop();
          itemObj.floatTween = undefined;
        }
      });

      item.on('dragend', () => {
        this.checkItemPlacement(item, itemData);
      });

      const itemObj: ItemObject = {
        data: itemData,
        graphics: item,
        placed: false,
      };

      // Idle float animation using absolute positions to prevent drift
      const itemBaseY = itemData.position.y;
      const hlBaseY = itemData.position.y - itemData.size * 0.3;
      const floatDuration = 1800 + Math.random() * 400;
      const floatDelay = Math.random() * 1000;
      itemObj.floatTween = this.scene.tweens.add({
        targets: item,
        y: { from: itemBaseY, to: itemBaseY - 3 },
        duration: floatDuration,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: floatDelay,
      });
      this.scene.tweens.add({
        targets: highlightCircle,
        y: { from: hlBaseY, to: hlBaseY - 3 },
        duration: floatDuration,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: floatDelay,
      });

      this.items.push(itemObj);
      this.container.add([item, highlightCircle]);
    });
  }

  private checkItemPlacement(item: Phaser.GameObjects.Arc, itemData: SortItem): void {
    const itemBounds = item.getBounds();

    for (const bin of this.bins) {
      const binBounds = new Phaser.Geom.Rectangle(
        bin.data.position.x - bin.data.size.x / 2,
        bin.data.position.y - bin.data.size.y / 2,
        bin.data.size.x,
        bin.data.size.y
      );

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
    bin.placedCount++;

    // Stop float animation
    if (itemObj.floatTween) {
      itemObj.floatTween.stop();
      itemObj.floatTween = undefined;
    }

    // Stack items inside bin - each new item stacks higher
    const stackOffset = bin.placedCount * 8;
    const targetY = bin.data.position.y + bin.data.size.y / 2 - 20 - stackOffset;

    // Settle animation with bounce
    this.scene.tweens.add({
      targets: item,
      x: bin.data.position.x + (Math.random() - 0.5) * 10,
      y: targetY,
      scale: 0.7,
      duration: 200,
      ease: 'Bounce.out',
    });

    // Move highlight with item
    const highlight = item.getData('highlight') as Phaser.GameObjects.Circle;
    if (highlight) {
      this.scene.tweens.add({
        targets: highlight,
        x: bin.data.position.x - itemData.size * 0.25 + (Math.random() - 0.5) * 10,
        y: targetY - itemData.size * 0.3,
        scale: 0.7,
        duration: 200,
        ease: 'Bounce.out',
      });
    }

    item.disableInteractive();

    // Visual effects
    Effects.particles(item.x, item.y, { color: bin.data.color, count: 12, speed: 200 });
    Effects.sparkle(item.x, item.y, 3);
    Effects.ripple(item.x, item.y, bin.data.color);
    AudioManager.playSound('snap');
    AudioManager.playSound('drop');
    InputManager.vibrate(20);

    this.recordCombo(item.x, item.y);

    // Flash bin border
    bin.body.setFillStyle(bin.data.color, 0.5);
    bin.highlight.setAlpha(0.35);
    this.scene.time.delayedCall(200, () => {
      bin.body.setFillStyle(bin.data.color, 0.2);
      bin.highlight.setAlpha(0.15);
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
    const highlight = item.getData('highlight') as Phaser.GameObjects.Circle;

    this.scene.tweens.add({
      targets: item,
      x: itemData.position.x,
      y: itemData.position.y,
      duration: 200,
      ease: 'Back.out',
    });

    if (highlight) {
      this.scene.tweens.add({
        targets: highlight,
        x: itemData.position.x - itemData.size * 0.25,
        y: itemData.position.y - itemData.size * 0.3,
        duration: 200,
        ease: 'Back.out',
        onComplete: () => {
          const itemObj = this.items.find(it => it.data.id === itemData.id);
          if (itemObj && !itemObj.placed) {
            const baseY = itemData.position.y;
            const hlBaseY = itemData.position.y - itemData.size * 0.3;
            const dur = 1800 + Math.random() * 400;
            itemObj.floatTween = this.scene.tweens.add({
              targets: item,
              y: { from: baseY, to: baseY - 3 },
              duration: dur,
              ease: 'Sine.inOut',
              yoyo: true,
              repeat: -1,
            });
            this.scene.tweens.add({
              targets: highlight,
              y: { from: hlBaseY, to: hlBaseY - 3 },
              duration: dur,
              ease: 'Sine.inOut',
              yoyo: true,
              repeat: -1,
            });
          }
        },
      });
    }
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
    this.items.forEach(item => {
      if (item.floatTween) item.floatTween.stop();
      const hl = item.graphics.getData('highlight') as Phaser.GameObjects.Circle;
      if (hl) hl.destroy();
      item.graphics.destroy();
    });
    this.bins.forEach(bin => {
      bin.container.destroy();
    });
    this.container.destroy();
  }
}
