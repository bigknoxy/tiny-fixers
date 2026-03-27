import Phaser from 'phaser';
import { COLORS } from '@/config/colors';
import { UI, ANIMATIONS } from '@/config/game.config';
import { getAchievementById } from '@/data/achievements';
import { EventBus } from '@/core/EventBus';
import { StateManager } from '@/core/StateManager';
import { Effects } from '@/systems/Effects';
import { AudioManager } from '@/systems/AudioManager';
import { InputManager } from '@/systems/InputManager';

export class AchievementNotification {
  private static queue: string[] = [];
  private static isShowing: boolean = false;

  static show(scene: Phaser.Scene, achievementId: string): void {
    this.queue.push(achievementId);
    if (!this.isShowing) {
      this.showNext(scene);
    }
  }

  private static showNext(scene: Phaser.Scene): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievementId = this.queue.shift()!;
    const def = getAchievementById(achievementId);
    const achievement = StateManager.getAchievement(achievementId);

    if (!def || !achievement) {
      this.showNext(scene);
      return;
    }

    this.displayNotification(scene, def, () => {
      this.showNext(scene);
    });
  }

  private static displayNotification(
    scene: Phaser.Scene,
    def: ReturnType<typeof getAchievementById>,
    onComplete: () => void
  ): void {
    if (!def) {
      onComplete();
      return;
    }

    const { width } = scene.scale;
    const centerX = width / 2;

    const container = scene.add.container(centerX, -100);

    const bg = scene.add.rectangle(0, 0, 300, 80, COLORS.MUSTARD, 0.95);
    bg.setStrokeStyle(3, COLORS.WHITE, 0.8);

    const icon = scene.add.text(-120, 0, def.icon, {
      fontSize: '36px',
    }).setOrigin(0.5);

    const title = scene.add.text(-80, -15, 'Achievement Unlocked!', {
      fontFamily: UI.FONT_FAMILY_BODY,
      fontSize: '12px',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    const name = scene.add.text(-80, 8, def.name, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0, 0.5);

    const reward = scene.add.text(100, 0, `+${def.reward}`, {
      fontFamily: UI.FONT_FAMILY_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    container.add([bg, icon, title, name, reward]);
    container.setDepth(1000);

    Effects.confetti(centerX, 60, 15);
    AudioManager.playSound('success');
    InputManager.vibrate(50);

    scene.tweens.add({
      targets: container,
      y: 80,
      duration: 400,
      ease: ANIMATIONS.BOUNCE_EASE,
      onComplete: () => {
        scene.time.delayedCall(2500, () => {
          scene.tweens.add({
            targets: container,
            y: -100,
            alpha: 0,
            duration: 300,
            ease: ANIMATIONS.SMOOTH_EASE,
            onComplete: () => {
              container.destroy();
              onComplete();
            },
          });
        });
      },
    });
  }

  static setupListeners(scene: Phaser.Scene): void {
    EventBus.onScene(scene, 'achievement:unlocked', (data) => {
      this.show(scene, data.achievementId);
    });
  }
}
