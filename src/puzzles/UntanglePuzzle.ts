import Phaser from 'phaser';
import { BasePuzzle } from './BasePuzzle';
import { LevelData, UntangleConfig, UntangleObject } from '@/config/types';
import { COLORS } from '@/config/colors';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

interface ObjectData {
  data: UntangleObject;
  graphics: Phaser.GameObjects.Shape;
  innerDetail?: Phaser.GameObjects.Shape;
  isOverlapping: boolean;
  wasPreviouslyOverlapping: boolean;
}

export class UntanglePuzzle extends BasePuzzle {
  private objects: ObjectData[] = [];
  private separationThreshold: number = 5;
  private hasStartedOverlapping: boolean = false;
  private connectionLines: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, level: LevelData) {
    super(scene, level);
  }

  init(): void {
    const config = this.level.config as UntangleConfig;
    this.separationThreshold = config.separationThreshold;

    // Create connection lines graphics layer (drawn behind objects)
    this.connectionLines = this.scene.add.graphics();
    this.container.add(this.connectionLines);

    // Subtle radial grid for spatial reference
    this.createBackgroundGrid();

    this.createObjects(config.objects);
    this.checkInitialOverlap();
    this.startTimer();
  }

  private createBackgroundGrid(): void {
    const grid = this.scene.add.graphics();
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;

    grid.lineStyle(1, 0x000000, 0.03);
    for (let r = 50; r <= 250; r += 50) {
      grid.strokeCircle(cx, cy, r);
    }
    this.container.add(grid);
  }

  private checkInitialOverlap(): void {
    this.checkOverlaps();

    if (!this.hasStartedOverlapping) {
      console.warn('Level starts with non-overlapping objects - this may be a level design issue');
    }
  }

  private createObjects(objects: UntangleObject[]): void {
    objects.forEach((objData) => {
      let shape: Phaser.GameObjects.Shape;
      let innerDetail: Phaser.GameObjects.Shape | undefined;

      switch (objData.shape) {
        case 'circle':
          shape = this.createDraggableCircle(
            objData.position.x,
            objData.position.y,
            objData.size,
            objData.color,
            objData.id
          );
          break;
        case 'square':
          shape = this.createDraggableObject(
            objData.position.x,
            objData.position.y,
            objData.size * 1.5,
            objData.size * 1.5,
            objData.color,
            objData.id
          );
          // Inner concentric square
          innerDetail = this.scene.add.rectangle(
            objData.position.x,
            objData.position.y,
            objData.size * 0.8,
            objData.size * 0.8,
            this.lightenColor(objData.color, 0.3),
            0.4
          );
          break;
        case 'triangle': {
          shape = this.scene.add.triangle(
            objData.position.x,
            objData.position.y,
            0,
            -objData.size,
            objData.size,
            objData.size,
            -objData.size,
            objData.size,
            objData.color
          );
          this.setupShapeDrag(shape);
          // Inner triangle detail
          const s = objData.size * 0.5;
          innerDetail = this.scene.add.triangle(
            objData.position.x,
            objData.position.y,
            0, -s, s, s, -s, s,
            0xFFFFFF, 0.15
          );
          break;
        }
        case 'star':
          shape = this.scene.add.star(
            objData.position.x,
            objData.position.y,
            5,
            objData.size * 0.4,
            objData.size,
            objData.color
          );
          this.setupShapeDrag(shape);
          // Highlight dots
          innerDetail = this.scene.add.circle(
            objData.position.x - objData.size * 0.15,
            objData.position.y - objData.size * 0.2,
            objData.size * 0.12,
            0xFFFFFF,
            0.35
          );
          break;
        default:
          shape = this.createDraggableCircle(
            objData.position.x,
            objData.position.y,
            objData.size,
            objData.color,
            objData.id
          );
      }

      shape.setStrokeStyle(2, COLORS.WHITE, 0.5);
      shape.setData('id', objData.id);
      shape.setData('originalX', objData.position.x);
      shape.setData('originalY', objData.position.y);

      // Track inner detail for movement sync
      if (innerDetail) {
        shape.setData('innerDetail', innerDetail);
        shape.on('drag', () => {
          innerDetail!.x = shape.x + (innerDetail!.x - shape.getData('prevX'));
          innerDetail!.y = shape.y + (innerDetail!.y - shape.getData('prevY'));
          shape.setData('prevX', shape.x);
          shape.setData('prevY', shape.y);
        });
        shape.on('dragstart', () => {
          shape.setData('prevX', shape.x);
          shape.setData('prevY', shape.y);
        });
      }

      const objDataEntry: ObjectData = {
        data: objData,
        graphics: shape,
        innerDetail,
        isOverlapping: false,
        wasPreviouslyOverlapping: false,
      };

      this.objects.push(objDataEntry);
      this.container.add(shape);
      if (innerDetail) this.container.add(innerDetail);
    });
  }

  private setupShapeDrag(shape: Phaser.GameObjects.Shape): void {
    shape.setInteractive({ useHandCursor: true, draggable: true });
    this.scene.input.setDraggable(shape);

    shape.on('dragstart', () => {
      this.scene.children.bringToTop(shape);
      this.scene.tweens.add({
        targets: shape,
        scale: 1.1,
        duration: 100,
      });
      InputManager.vibrate(10);
      AudioManager.playSound('pickup');
      this.totalMoves++;
    });

    shape.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      shape.x = dragX;
      shape.y = dragY;
    });

    shape.on('dragend', () => {
      this.scene.tweens.add({
        targets: shape,
        scale: 1,
        duration: 100,
      });
    });
  }

  update(_delta: number): void {
    this.checkOverlaps();
    this.drawConnectionLines();
  }

  private drawConnectionLines(): void {
    if (!this.connectionLines) return;
    this.connectionLines.clear();

    for (let i = 0; i < this.objects.length; i++) {
      if (!this.objects[i].isOverlapping) continue;

      for (let j = i + 1; j < this.objects.length; j++) {
        if (!this.objects[j].isOverlapping) continue;

        const obj1 = this.objects[i];
        const obj2 = this.objects[j];
        const dx = obj1.graphics.x - obj2.graphics.x;
        const dy = obj1.graphics.y - obj2.graphics.y;
        const distanceSq = dx * dx + dy * dy;
        const minDistance = (obj1.data.size + obj2.data.size) - this.separationThreshold;

        if (distanceSq < minDistance * minDistance) {
          // Red connection line with pulsing alpha
          const alpha = 0.2 + Math.sin(Date.now() * 0.005) * 0.1;
          this.connectionLines.lineStyle(2, COLORS.ERROR, alpha);
          this.connectionLines.lineBetween(
            obj1.graphics.x, obj1.graphics.y,
            obj2.graphics.x, obj2.graphics.y
          );
        }
      }
    }
  }

  private checkOverlaps(): void {
    let anyOverlapping = false;

    for (let i = 0; i < this.objects.length; i++) {
      const obj1 = this.objects[i];
      let isOverlapping = false;

      for (let j = 0; j < this.objects.length; j++) {
        if (i === j) continue;

        const obj2 = this.objects[j];
        const dx = obj1.graphics.x - obj2.graphics.x;
        const dy = obj1.graphics.y - obj2.graphics.y;
        const distanceSq = dx * dx + dy * dy;
        const minDistance = (obj1.data.size + obj2.data.size) - this.separationThreshold;
        const minDistanceSq = minDistance * minDistance;

        if (distanceSq < minDistanceSq) {
          isOverlapping = true;
          anyOverlapping = true;
          break;
        }
      }

      // Detect separation event: was overlapping, now isn't
      if (obj1.wasPreviouslyOverlapping && !isOverlapping) {
        // Flash green + sparkle on separation
        obj1.graphics.setStrokeStyle(3, COLORS.SUCCESS, 1);
        Effects.sparkle(obj1.graphics.x, obj1.graphics.y, 2);
        AudioManager.playSound('snap');
        this.scene.time.delayedCall(300, () => {
          if (!obj1.isOverlapping) {
            obj1.graphics.setStrokeStyle(2, COLORS.WHITE, 0.5);
          }
        });
      }

      obj1.wasPreviouslyOverlapping = obj1.isOverlapping;
      obj1.isOverlapping = isOverlapping;

      if (isOverlapping && !obj1.graphics.getData('highlighted')) {
        obj1.graphics.setStrokeStyle(3, COLORS.ERROR, 1);
        obj1.graphics.setData('highlighted', true);
      } else if (!isOverlapping && obj1.graphics.getData('highlighted')) {
        obj1.graphics.setStrokeStyle(2, COLORS.WHITE, 0.5);
        obj1.graphics.setData('highlighted', false);
      }
    }

    if (anyOverlapping) {
      this.hasStartedOverlapping = true;
    }

    if (!anyOverlapping && !this.isComplete && this.hasStartedOverlapping) {
      this.isComplete = true;
      this.stopTimer();
      this.onWin();
    }
  }

  private onWin(): void {
    this.objects.forEach(obj => {
      Effects.particles(obj.graphics.x, obj.graphics.y, {
        color: obj.data.color,
        count: 8,
        speed: 150,
      });
      Effects.sparkle(obj.graphics.x, obj.graphics.y, 2);
    });

    if (this.wrongMoves === 0) {
      const centerX = this.objects.reduce((sum, obj) => sum + obj.graphics.x, 0) / this.objects.length;
      const centerY = this.objects.reduce((sum, obj) => sum + obj.graphics.y, 0) / this.objects.length;
      Effects.perfect(centerX, centerY);
      AudioManager.playSound('perfect');
    } else {
      AudioManager.playSound('success');
    }
    InputManager.vibrate(40);
  }

  private lightenColor(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xFF) + Math.floor(255 * amount));
    const g = Math.min(255, ((color >> 8) & 0xFF) + Math.floor(255 * amount));
    const b = Math.min(255, (color & 0xFF) + Math.floor(255 * amount));
    return (r << 16) | (g << 8) | b;
  }

  checkWin(): boolean {
    return this.isComplete;
  }

  getSeparatedCount(): number {
    return this.objects.filter(obj => !obj.isOverlapping).length;
  }

  getProgress(): { placed: number; total: number } {
    return {
      placed: this.getSeparatedCount(),
      total: this.objects.length,
    };
  }

  destroy(): void {
    if (this.connectionLines) this.connectionLines.destroy();
    this.objects.forEach(obj => {
      if (obj.innerDetail) obj.innerDetail.destroy();
      obj.graphics.destroy();
    });
    this.container.destroy();
  }
}
