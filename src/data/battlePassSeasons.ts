export interface BPReward {
  type: 'coins' | 'materials' | 'cosmetic';
  id: string;
  amount: number;
  label: string;
}

export interface BattlePassTier {
  level: number;
  xpRequired: number;
  freeReward: BPReward;
  premiumReward?: BPReward;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  tiers: BattlePassTier[];
}

function tierXP(level: number): number {
  // Escalating: 100, 120, 140... leveling out at 400
  return Math.min(400, 100 + (level - 1) * 20);
}

export const SEASON_1: BattlePassSeason = {
  id: 'season_1',
  name: 'Spring Fixers',
  tiers: Array.from({ length: 30 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      xpRequired: tierXP(level),
      freeReward: getFreeReward(level),
      premiumReward: getPremiumReward(level),
    };
  }),
};

function getFreeReward(level: number): BPReward {
  if (level % 5 === 0) {
    return { type: 'coins', id: 'coins', amount: 50 + level * 2, label: `${50 + level * 2} Coins` };
  }
  if (level % 3 === 0) {
    return { type: 'materials', id: 'wood', amount: 2, label: '2 Wood' };
  }
  return { type: 'coins', id: 'coins', amount: 20 + level, label: `${20 + level} Coins` };
}

function getPremiumReward(level: number): BPReward | undefined {
  if (level % 10 === 0) {
    return { type: 'cosmetic', id: `theme_${level}`, amount: 1, label: 'Exclusive Theme' };
  }
  if (level % 5 === 0) {
    return { type: 'coins', id: 'coins', amount: 100 + level * 3, label: `${100 + level * 3} Coins` };
  }
  if (level % 2 === 0) {
    return { type: 'materials', id: 'mixed', amount: 3, label: '3 Materials' };
  }
  return undefined;
}

export const CURRENT_SEASON = SEASON_1;
