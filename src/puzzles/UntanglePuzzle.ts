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
  isOverlapping: boolean;
}

export class UntanglePuzzle extends BasePuzzle {
  private objects: ObjectData[] = [];
  private separationThreshold: number = 5;
  private hasStartedOverlapping: boolean = false;

  constructor(scene: Phaser.Scene, level: LevelData) {
    super(scene, level);
  }

  init(): void {
    const config = this.level.config as UntangleConfig;
    this.separationThreshold = config.separationThreshold;
    
    this.createObjects(config.objects);
    this.checkInitialOverlap();
    this.startTimer();
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
          break;
        case 'triangle':
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
          break;
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
      
      const objDataEntry: ObjectData = {
        data: objData,
        graphics: shape,
        isOverlapping: false,
      };
      
      this.objects.push(objDataEntry);
      this.container.add(shape);
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
    this.objects.forEach(obj => {
      obj.graphics.destroy();
    });
    this.container.destroy();
  }
}
