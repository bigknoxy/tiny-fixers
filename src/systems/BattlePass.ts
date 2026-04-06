import { BattlePassState } from '@/config/types';
import { EventBus } from '@/core/EventBus';
import { CURRENT_SEASON, BattlePassSeason } from '@/data/battlePassSeasons';

export function createDefaultBattlePassState(): BattlePassState {
  return {
    seasonId: CURRENT_SEASON.id,
    currentXP: 0,
    currentTier: 0,
    claimedFreeTiers: [],
    claimedPremiumTiers: [],
    isPremium: false,
  };
}

type PersistCallback = (state: BattlePassState) => void;

class BattlePassClass {
  private state: BattlePassState = createDefaultBattlePassState();
  private season: BattlePassSeason = CURRENT_SEASON;
  private initialized = false;
  private onPersist: PersistCallback | null = null;

  init(state: BattlePassState | undefined, persistCallback?: PersistCallback): void {
    if (state && state.seasonId === CURRENT_SEASON.id) {
      this.state = state;
    } else {
      this.state = createDefaultBattlePassState();
    }
    if (persistCallback) {
      this.onPersist = persistCallback;
    }

    if (!this.initialized) {
      this.initialized = true;
      // Subscribe to level completions for XP
      EventBus.on('level:complete', (data) => {
        this.addXP(data.stars * 10, 'level_complete');
      });
    }
  }

  private persist(): void {
    if (this.onPersist) {
      this.onPersist(this.state);
    }
  }

  getState(): BattlePassState {
    return {
      ...this.state,
      claimedFreeTiers: [...this.state.claimedFreeTiers],
      claimedPremiumTiers: [...this.state.claimedPremiumTiers],
    };
  }

  getSeason(): BattlePassSeason {
    return this.season;
  }

  getCurrentTier(): number {
    return this.state.currentTier;
  }

  getCurrentXP(): number {
    return this.state.currentXP;
  }

  getXPForNextTier(): number {
    if (this.state.currentTier >= this.season.tiers.length) return 0;
    return this.season.tiers[this.state.currentTier].xpRequired;
  }

  addXP(amount: number, source: string): void {
    this.state.currentXP += amount;
    EventBus.emit('battlepass:xp', { amount, source });

    while (this.state.currentTier < this.season.tiers.length) {
      const requiredXP = this.season.tiers[this.state.currentTier].xpRequired;
      if (this.state.currentXP >= requiredXP) {
        this.state.currentXP -= requiredXP;
        this.state.currentTier++;
        EventBus.emit('battlepass:tierup', { tier: this.state.currentTier });
      } else {
        break;
      }
    }

    this.persist();
  }

  claimFreeReward(tier: number): boolean {
    if (tier > this.state.currentTier) return false;
    if (this.state.claimedFreeTiers.includes(tier)) return false;
    this.state.claimedFreeTiers.push(tier);
    EventBus.emit('battlepass:claim', { tier, track: 'free' });
    this.persist();
    return true;
  }

  claimPremiumReward(tier: number): boolean {
    if (!this.state.isPremium) return false;
    if (tier > this.state.currentTier) return false;
    if (this.state.claimedPremiumTiers.includes(tier)) return false;
    this.state.claimedPremiumTiers.push(tier);
    EventBus.emit('battlepass:claim', { tier, track: 'premium' });
    this.persist();
    return true;
  }

  isMaxTier(): boolean {
    return this.state.currentTier >= this.season.tiers.length;
  }
}

export const BattlePass = new BattlePassClass();
