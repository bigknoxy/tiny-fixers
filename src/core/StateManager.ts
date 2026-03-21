import { STORAGE_KEY } from '@/config/game.config';
import {
  GameState,
  PlayerState,
  ProgressState,
  EconomyState,
  SettingsState,
  DailyState,
  MaterialType,
} from '@/config/types';
import { EventBus } from './EventBus';
import { LEVELS } from '@/data/levels';

const CURRENT_VERSION = 1;

function migrateState(state: unknown, version: number): GameState {
  if (version >= CURRENT_VERSION) {
    return state as GameState;
  }
  return state as GameState;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultPlayer(): PlayerState {
  return {
    id: generateId(),
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    totalPlayTime: 0,
    tutorialCompleted: false,
  };
}

function createDefaultProgress(): ProgressState {
  return {
    completedLevels: {},
    totalStars: 0,
    currentLevel: 1,
    hubProgress: {
      flower_shop: { id: 'flower_shop', currentStage: 0, maxStage: 3, unlocked: true },
      tool_shed: { id: 'tool_shed', currentStage: 0, maxStage: 3, unlocked: false },
    },
    unlockedPuzzles: ['sort_01', 'sort_02', 'sort_03'],
    unlockedCharacters: ['helper_01'],
    unlockedDecorations: [],
    unlockedWorlds: ['world_sort'],
  };
}

function createDefaultEconomy(): EconomyState {
  return {
    coins: 100,
    materials: {
      [MaterialType.WOOD]: 10,
      [MaterialType.BRICK]: 5,
      [MaterialType.PAINT]: 3,
      [MaterialType.GLASS]: 2,
      [MaterialType.METAL]: 1,
    },
  };
}

function createDefaultSettings(): SettingsState {
  return {
    musicVolume: 0.7,
    sfxVolume: 1.0,
    hapticsEnabled: true,
    notificationsEnabled: true,
  };
}

function createDefaultDaily(): DailyState {
  return {
    lastPlayDate: null,
    currentStreak: 0,
    longestStreak: 0,
    todayChallengeCompleted: false,
    weeklyRewardsClaimed: [],
  };
}

function createDefaultState(): GameState {
  return {
    version: CURRENT_VERSION,
    player: createDefaultPlayer(),
    progress: createDefaultProgress(),
    economy: createDefaultEconomy(),
    settings: createDefaultSettings(),
    daily: createDefaultDaily(),
    achievements: [],
  };
}

class StateManagerClass {
  private _state: GameState;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this._state = createDefaultState();
  }

  get state(): GameState {
    return this._state;
  }

  async load(): Promise<void> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const version = (parsed.version as number) || 0;
        
        if (version === CURRENT_VERSION) {
          this._state = parsed as GameState;
        } else if (version < CURRENT_VERSION) {
          this._state = migrateState(parsed, version);
          this.save();
        } else {
          console.warn('Save file from newer version, using defaults');
          this._state = createDefaultState();
        }
        
        this.updateLastPlayed();
        return;
      }
    } catch (error) {
      console.warn('Failed to load saved state, using defaults:', error);
    }
    this._state = createDefaultState();
  }

  async save(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  saveSync(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (error) {
      console.error('Failed to save state synchronously:', error);
    }
  }

  queueSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, 500);
  }

  reset(): void {
    this._state = createDefaultState();
    localStorage.removeItem(STORAGE_KEY);
    EventBus.emit('state:reset');
  }

  private updateLastPlayed(): void {
    this._state.player.lastPlayedAt = Date.now();
    this.queueSave();
  }

  addCoins(amount: number): void {
    this._state.economy.coins += amount;
    this.queueSave();
    EventBus.emit('currency:earned', { type: 'coins', amount });
  }

  spendCoins(amount: number): boolean {
    if (this._state.economy.coins >= amount) {
      this._state.economy.coins -= amount;
      this.queueSave();
      EventBus.emit('currency:spent', { type: 'coins', amount });
      return true;
    }
    return false;
  }

  addMaterial(type: MaterialType, amount: number): void {
    const current = this._state.economy.materials[type] || 0;
    this._state.economy.materials[type] = current + amount;
    this.queueSave();
    EventBus.emit('currency:earned', { type, amount });
  }

  spendMaterials(materials: { type: MaterialType; amount: number }[]): boolean {
    for (const { type, amount } of materials) {
      const current = this._state.economy.materials[type] || 0;
      if (current < amount) {
        return false;
      }
    }
    for (const { type, amount } of materials) {
      this._state.economy.materials[type] -= amount;
    }
    this.queueSave();
    return true;
  }

  completeLevel(levelId: string, stars: number, time: number): void {
    const existing = this._state.progress.completedLevels[levelId];
    
    if (!existing || stars > existing.stars) {
      const starDiff = existing ? Math.max(0, stars - existing.stars) : stars;
      this._state.progress.totalStars += starDiff;
    }

    this._state.progress.completedLevels[levelId] = {
      stars: Math.max(stars, existing?.stars || 0),
      bestTime: existing ? Math.min(time, existing.bestTime) : time,
      completedAt: Date.now(),
    };

    const levelIndex = LEVELS.findIndex(l => l.id === levelId);
    if (levelIndex >= 0 && levelIndex >= this._state.progress.currentLevel - 1) {
      this._state.progress.currentLevel = levelIndex + 2;
    }

    this.queueSave();
    EventBus.emit('level:complete', { levelId, stars, time });
  }

  isLevelUnlocked(levelId: string, levelIndex?: number): boolean {
    if (this._state.progress.unlockedPuzzles.includes(levelId)) {
      return true;
    }
    if (levelIndex !== undefined) {
      return levelIndex < this._state.progress.currentLevel;
    }
    const levelNum = parseInt(levelId.split('_')[1]) || 1;
    return levelNum <= this._state.progress.currentLevel;
  }

  getLevelProgress(levelId: string): { stars: number; completed: boolean } {
    const progress = this._state.progress.completedLevels[levelId];
    return {
      stars: progress?.stars || 0,
      completed: !!progress?.completedAt,
    };
  }

  isWorldUnlocked(worldId: string, requiredStars: number): boolean {
    if (this._state.progress.unlockedWorlds.includes(worldId)) {
      return true;
    }
    return this._state.progress.totalStars >= requiredStars;
  }

  unlockWorld(worldId: string): void {
    if (!this._state.progress.unlockedWorlds.includes(worldId)) {
      this._state.progress.unlockedWorlds.push(worldId);
      this.queueSave();
      EventBus.emit('world:unlocked', { worldId });
    }
  }

  getWorldStars(_worldId: string, levelIds: string[]): number {
    return levelIds.reduce((total, levelId) => {
      return total + (this._state.progress.completedLevels[levelId]?.stars || 0);
    }, 0);
  }

  upgradeHub(locationId: string): boolean {
    const location = this._state.progress.hubProgress[locationId];
    if (!location || !location.unlocked) return false;

    if (location.currentStage >= location.maxStage) return false;

    location.currentStage++;
    this.queueSave();
    EventBus.emit('hub:upgrade', { locationId, stage: location.currentStage });
    return true;
  }

  unlockHubLocation(locationId: string): void {
    const location = this._state.progress.hubProgress[locationId];
    if (location) {
      location.unlocked = true;
      this.queueSave();
    }
  }

  updateDailyStreak(): { streak: number; isNewDay: boolean } {
    const today = new Date().toISOString().split('T')[0];
    const lastPlay = this._state.daily.lastPlayDate;

    if (lastPlay === today) {
      return { streak: this._state.daily.currentStreak, isNewDay: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;

    if (lastPlay === yesterday) {
      newStreak = this._state.daily.currentStreak + 1;
    }

    this._state.daily.lastPlayDate = today;
    this._state.daily.currentStreak = newStreak;
    this._state.daily.todayChallengeCompleted = false;

    if (newStreak > this._state.daily.longestStreak) {
      this._state.daily.longestStreak = newStreak;
    }

    this.queueSave();
    EventBus.emit('daily:streak', { streak: newStreak });
    return { streak: newStreak, isNewDay: true };
  }

  getDailyReward(): number {
    const streak = this._state.daily.currentStreak;
    const rewards = [20, 25, 30, 40, 50, 75, 100];
    const dayIndex = (streak - 1) % 7;
    return rewards[dayIndex];
  }

  completeDailyChallenge(): void {
    this._state.daily.todayChallengeCompleted = true;
    this.queueSave();
  }

  updateSettings(settings: Partial<SettingsState>): void {
    this._state.settings = { ...this._state.settings, ...settings };
    this.queueSave();
    EventBus.emit('settings:changed', settings);
  }

  completeTutorial(): void {
    this._state.player.tutorialCompleted = true;
    this.saveSync();
    EventBus.emit('tutorial:completed');
  }

  isTutorialCompleted(): boolean {
    return this._state.player.tutorialCompleted;
  }
}

export const StateManager = new StateManagerClass();