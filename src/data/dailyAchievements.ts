/** Daily challenge specific achievement definitions */
export const DAILY_ACHIEVEMENTS = [
  {
    id: 'daily_first',
    name: 'Daily Debut',
    description: 'Complete your first daily challenge',
    category: 'challenge',
    icon: '🌅',
    condition: { type: 'daily_challenges_completed' as const, value: 1 },
    reward: 25,
  },
  {
    id: 'daily_week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 daily challenges',
    category: 'challenge',
    icon: '🗓️',
    condition: { type: 'daily_challenges_completed' as const, value: 7 },
    reward: 100,
  },
  {
    id: 'daily_dedication',
    name: 'Daily Dedication',
    description: 'Complete 30 daily challenges',
    category: 'challenge',
    icon: '🏆',
    condition: { type: 'daily_challenges_completed' as const, value: 30 },
    reward: 300,
  },
  {
    id: 'daily_streak_7',
    name: 'Streak Starter',
    description: 'Reach a 7-day daily streak',
    category: 'challenge',
    icon: '🔥',
    condition: { type: 'daily_streak_record' as const, value: 7 },
    reward: 150,
  },
  {
    id: 'daily_streak_30',
    name: 'Monthly Master',
    description: 'Reach a 30-day daily streak',
    category: 'challenge',
    icon: '👑',
    condition: { type: 'daily_streak_record' as const, value: 30 },
    reward: 500,
  },
  {
    id: 'daily_precision_10',
    name: 'Precision Master',
    description: 'Complete 10 precision mode dailies',
    category: 'challenge',
    icon: '🎯',
    condition: { type: 'daily_precision_completed' as const, value: 10 },
    reward: 200,
  },
  {
    id: 'daily_speed_10',
    name: 'Speed Demon',
    description: 'Complete 10 speed round dailies',
    category: 'challenge',
    icon: '⚡',
    condition: { type: 'daily_speed_completed' as const, value: 10 },
    reward: 200,
  },
  {
    id: 'daily_perfect_5',
    name: 'Perfect Daily',
    description: 'Complete 5 daily challenges perfectly',
    category: 'challenge',
    icon: '💯',
    condition: { type: 'daily_perfect_streak' as const, value: 5 },
    reward: 250,
  },
] as const;

/** Extended condition types for daily challenges */
export type DailyAchievementConditionType = 
  | 'daily_challenges_completed'
  | 'daily_streak_record'
  | 'daily_precision_completed'
  | 'daily_speed_completed'
  | 'daily_perfect_streak';

/** Combined achievement condition type */
export type AchievementConditionType = 
  | 'levels_completed'
  | 'stars_earned'
  | 'endless_score'
  | 'daily_streak'
  | 'perfect_levels'
  | 'speedrun'
  | 'puzzle_type_master'
  | 'coins_earned'
  | 'total_games'
  | DailyAchievementConditionType;

/** Get all achievement definitions including daily ones */
export function getAllAchievementDefinitions() {
  // Import from achievements.ts to get the base definitions
  // This function is used by StateManager to check daily achievements
  return DAILY_ACHIEVEMENTS;
}
