import { Achievement, PuzzleType } from '@/config/types';

export type AchievementCategory = 'progression' | 'skill' | 'collection' | 'dedication' | 'challenge';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  condition: {
    type: 'levels_completed' | 'stars_earned' | 'endless_score' | 'daily_streak' | 'perfect_levels' | 'speedrun' | 'puzzle_type_master' | 'coins_earned' | 'total_games';
    value: number;
    puzzleType?: PuzzleType;
  };
  reward: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Progression - completing levels
  { id: 'first_fix', name: 'First Fix', description: 'Complete your first puzzle', category: 'progression', icon: '🔧', condition: { type: 'levels_completed', value: 1 }, reward: 25 },
  { id: 'getting_started', name: 'Getting Started', description: 'Complete 5 puzzles', category: 'progression', icon: '⭐', condition: { type: 'levels_completed', value: 5 }, reward: 50 },
  { id: 'problem_solver', name: 'Problem Solver', description: 'Complete 10 puzzles', category: 'progression', icon: '🧩', condition: { type: 'levels_completed', value: 10 }, reward: 75 },
  { id: 'fixer_upper', name: 'Fixer Upper', description: 'Complete 20 puzzles', category: 'progression', icon: '🏠', condition: { type: 'levels_completed', value: 20 }, reward: 100 },
  { id: 'half_century', name: 'Half Century', description: 'Complete 50 puzzles', category: 'progression', icon: '🎯', condition: { type: 'levels_completed', value: 50 }, reward: 150 },
  { id: 'master_fixer', name: 'Master Fixer', description: 'Complete 100 levels', category: 'progression', icon: '🏆', condition: { type: 'levels_completed', value: 100 }, reward: 300 },

  // Skill - stars earned
  { id: 'star_collector', name: 'Star Collector', description: 'Earn 10 stars', category: 'skill', icon: '⭐', condition: { type: 'stars_earned', value: 10 }, reward: 50 },
  { id: 'shining_bright', name: 'Shining Bright', description: 'Earn 30 stars', category: 'skill', icon: '🌟', condition: { type: 'stars_earned', value: 30 }, reward: 75 },
  { id: 'star_excellence', name: 'Star Excellence', description: 'Earn 60 stars', category: 'skill', icon: '💫', condition: { type: 'stars_earned', value: 60 }, reward: 150 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Earn 90 stars', category: 'skill', icon: '✨', condition: { type: 'stars_earned', value: 90 }, reward: 250 },
  { id: 'star_hoarder', name: 'Star Hoarder', description: 'Earn 200 stars', category: 'skill', icon: '🌠', condition: { type: 'stars_earned', value: 200 }, reward: 400 },

  // Dedication - daily streaks
  { id: 'consistency', name: 'Consistency', description: 'Play 3 days in a row', category: 'dedication', icon: '🔥', condition: { type: 'daily_streak', value: 3 }, reward: 50 },
  { id: 'weekly_warrior', name: 'Weekly Warrior', description: 'Play 7 days in a row', category: 'dedication', icon: '📅', condition: { type: 'daily_streak', value: 7 }, reward: 150 },
  { id: 'dedicated_fixer', name: 'Dedicated Fixer', description: 'Play 14 days in a row', category: 'dedication', icon: '💪', condition: { type: 'daily_streak', value: 14 }, reward: 300 },
  { id: 'monthly_master', name: 'Monthly Master', description: 'Play 30 days in a row', category: 'dedication', icon: '👑', condition: { type: 'daily_streak', value: 30 }, reward: 500 },

  // Challenge - endless mode
  { id: 'endless_beginner', name: 'Endless Beginner', description: 'Score 5 in Endless Mode', category: 'challenge', icon: '🎯', condition: { type: 'endless_score', value: 5 }, reward: 50 },
  { id: 'endless_pro', name: 'Endless Pro', description: 'Score 10 in Endless Mode', category: 'challenge', icon: '🚀', condition: { type: 'endless_score', value: 10 }, reward: 100 },
  { id: 'endless_master', name: 'Endless Master', description: 'Score 20 in Endless Mode', category: 'challenge', icon: '💎', condition: { type: 'endless_score', value: 20 }, reward: 200 },
  { id: 'endless_legend', name: 'Endless Legend', description: 'Score 50 in Endless Mode', category: 'challenge', icon: '🏅', condition: { type: 'endless_score', value: 50 }, reward: 500 },

  // Collection - puzzle type mastery
  { id: 'sort_master', name: 'Sort Master', description: 'Complete all Sort levels', category: 'collection', icon: '📦', condition: { type: 'puzzle_type_master', value: 10, puzzleType: PuzzleType.SORT }, reward: 150 },
  { id: 'untangle_master', name: 'Untangle Master', description: 'Complete all Untangle levels', category: 'collection', icon: '🔮', condition: { type: 'puzzle_type_master', value: 10, puzzleType: PuzzleType.UNTANGLE }, reward: 150 },
  { id: 'pack_master', name: 'Pack Master', description: 'Complete all Pack levels', category: 'collection', icon: '🎁', condition: { type: 'puzzle_type_master', value: 10, puzzleType: PuzzleType.PACK }, reward: 150 },

  // Perfect levels
  { id: 'no_mistakes', name: 'No Mistakes', description: 'Complete 5 levels without errors', category: 'skill', icon: '💯', condition: { type: 'perfect_levels', value: 5 }, reward: 100 },
  { id: 'flawless', name: 'Flawless', description: 'Complete 15 levels without errors', category: 'skill', icon: '🏅', condition: { type: 'perfect_levels', value: 15 }, reward: 200 },

  // Games played
  { id: 'enthusiast', name: 'Enthusiast', description: 'Play 50 games total', category: 'dedication', icon: '🎮', condition: { type: 'total_games', value: 50 }, reward: 100 },
  { id: 'veteran', name: 'Veteran', description: 'Play 100 games total', category: 'dedication', icon: '🎖️', condition: { type: 'total_games', value: 100 }, reward: 200 },
  { id: 'legend', name: 'Legend', description: 'Play 500 games total', category: 'dedication', icon: '🏆', condition: { type: 'total_games', value: 500 }, reward: 500 },
];

export function createInitialAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => ({
    id: def.id,
    name: def.name,
    description: def.description,
    condition: `${def.condition.type}:${def.condition.value}`,
    reward: def.reward,
    unlocked: false,
    unlockedAt: null,
  }));
}

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.category === category);
}

export function getTotalAchievementReward(): number {
  return ACHIEVEMENT_DEFINITIONS.reduce((sum, a) => sum + a.reward, 0);
}
