import { EventBus } from '@/core/EventBus';
import { CURRENT_SEASON, BattlePassSeason } from '@/data/battlePassSeasons';

export interface BattlePassState {
  seasonId: string;
  currentXP: number;
  currentTier: number;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
  isPremium: boolean;
}

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

class BattlePassClass {
  private state: BattlePassState = createDefaultBattlePassState();
  private season: BattlePassSeason = CURRENT_SEASON;

  init(state: BattlePassState | undefined): void {
    if (state && state.seasonId === CURRENT_SEASON.id) {
      this.state = state;
    } else {
      this.state = createDefaultBattlePassState();
    }
  }

  getState(): BattlePassState {
    return this.state;
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

    // Check for tier-ups
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
  }

  claimFreeReward(tier: number): boolean {
    if (tier > this.state.currentTier) return false;
    if (this.state.claimedFreeTiers.includes(tier)) return false;
    this.state.claimedFreeTiers.push(tier);
    return true;
  }

  claimPremiumReward(tier: number): boolean {
    if (!this.state.isPremium) return false;
    if (tier > this.state.currentTier) return false;
    if (this.state.claimedPremiumTiers.includes(tier)) return false;
    this.state.claimedPremiumTiers.push(tier);
    return true;
  }

  isMaxTier(): boolean {
    return this.state.currentTier >= this.season.tiers.length;
  }
}

export const BattlePass = new BattlePassClass();
