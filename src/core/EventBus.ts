import Phaser from 'phaser';
import { MaterialType, PuzzleType } from '@/config/types';

interface GameEventMap {
  'level:complete': { levelId: string; stars: number; time: number };
  'level:fail': { levelId: string; reason: string };
  'level:start': { levelId: string };
  'hub:upgrade': { locationId: string; stage: number };
  'currency:earned': { type: 'coins' | MaterialType; amount: number };
  'currency:spent': { type: 'coins' | MaterialType; amount: number };
  'achievement:unlocked': { achievementId: string };
  'daily:streak': { streak: number };
  'scene:transition': { from: string; to: string };
  'state:reset': void;
  'settings:changed': Record<string, unknown>;
  'audio:muted': { muted: boolean };
  'tutorial:completed': void;
  'tutorial:puzzleTypeSeen': { type: PuzzleType };
  'coins:changed': { amount: number; total: number };
}

type EventCallback<K extends keyof GameEventMap> = (data: GameEventMap[K]) => void;

class EventBusClass {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sceneListeners: Map<string, Set<{ event: string; callback: (...args: any[]) => void }>> = new Map();

  on<K extends keyof GameEventMap>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof GameEventMap>(event: K, callback: EventCallback<K>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit<K extends keyof GameEventMap>(event: K, data?: GameEventMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  once<K extends keyof GameEventMap>(event: K, callback: EventCallback<K>): void {
    const onceCallback: EventCallback<K> = (data) => {
      this.off(event, onceCallback);
      callback(data);
    };
    this.on(event, onceCallback);
  }

  onScene<K extends keyof GameEventMap>(
    scene: Phaser.Scene,
    event: K,
    callback: EventCallback<K>
  ): void {
    this.on(event, callback);
    
    const sceneKey = scene.scene.key;
    if (!this.sceneListeners.has(sceneKey)) {
      this.sceneListeners.set(sceneKey, new Set());
    }
    this.sceneListeners.get(sceneKey)!.add({ event, callback });
    
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.off(event, callback);
      const sceneListeners = this.sceneListeners.get(sceneKey);
      if (sceneListeners) {
        sceneListeners.forEach(item => {
          if (item.event === event && item.callback === callback) {
            sceneListeners.delete(item);
          }
        });
      }
    });
  }

  clear(): void {
    this.listeners.clear();
    this.sceneListeners.clear();
  }
}

export const EventBus = new EventBusClass();
