# Daily Challenges Implementation Plan

## Executive Summary

The current system has basic streak tracking in `DailyState` but lacks actual daily challenges with modifiers, unique rewards, and proper tracking. This plan implements a full Daily Challenges system with rotating puzzle types, deterministic seeded levels, and engaging modifiers.

---

## 1. New/Modified Files

### New Files (Create)
| File | Purpose |
|------|---------|
| `src/config/daily.ts` | Daily challenge configuration (modifiers, rewards, seeds) |
| `src/data/dailyGenerator.ts` | Generates daily challenge levels deterministically |
| `src/scenes/DailyChallengeScene.ts` | Entry screen showing today's challenge info |
| `src/data/dailyAchievements.ts` | Achievement definitions for daily challenges |

### Modified Files (Update)
| File | Changes |
|------|---------|
| `src/config/types.ts` | Add `DailyChallenge`, `DailyModifier`, `DailyCompletion` interfaces |
| `src/core/StateManager.ts` | Add daily challenge methods, update migration to v6 |
| `src/core/EventBus.ts` | Add daily challenge events |
| `src/scenes/HomeScene.ts` | Redirect daily button to new DailyChallengeScene |
| `src/scenes/GameScene.ts` | Handle daily modifiers (precision, speed) |
| `src/scenes/ResultsScene.ts` | Show daily challenge rewards |
| `src/config/game.config.ts` | Add daily challenge scene to registry |

---

## 2. Data Structures

### New Interfaces (add to `src/config/types.ts`)

```typescript
// ============================================
// DAILY CHALLENGE TYPES
// ============================================

/** Modifier types that change daily challenge behavior */
export enum DailyModifierType {
  SPEED_ROUND = 'speed_round',      // Reduced time limit
  PRECISION_MODE = 'precision_mode', // No wrong moves allowed
  BONUS_COINS = 'bonus_coins',       // Extra rewards
}

/** Configuration for a daily challenge modifier */
export interface DailyModifier {
  type: DailyModifierType;
  name: string;
  description: string;
  icon: string;
  // Modifier-specific config
  timeMultiplier?: number;           // For SPEED_ROUND (e.g., 0.6 = 60% time)
  allowedMistakes?: number;         // For PRECISION_MODE (0 = no mistakes)
  coinMultiplier?: number;           // For BONUS_COINS (e.g., 1.5 = 150% coins)
}

/** A daily challenge definition */
export interface DailyChallenge {
  date: string;                     // ISO date string (YYYY-MM-DD)
  puzzleType: PuzzleType;
  modifiers: DailyModifier[];
  difficulty: number;               // 1-5 based on day of week
  baseCoins: number;
  streakBonus: number;              // Additional coins per streak day
  completed: boolean;
  completionTime?: number;
}

/** Daily challenge completion record */
export interface DailyCompletion {
  date: string;
  puzzleType: PuzzleType;
  modifiers: DailyModifierType[];
  time: number;
  coinsEarned: number;
  streakAtCompletion: number;
}

/** Extended DailyState */
export interface DailyState {
  lastPlayDate: string | null;
  currentStreak: number;
  longestStreak: number;
  todayChallengeCompleted: boolean;
  weeklyRewardsClaimed: number[];
  // NEW: Daily challenge tracking
  completedChallenges: DailyCompletion[];
  totalDailyWins: number;
  lastCompletedDate: string | null;
}

/** Extended AchievementStats */
export interface AchievementStats {
  totalGamesPlayed: number;
  perfectLevels: number;
  totalCoinsEarned: number;
  levelsCompletedPerType: Partial<Record<PuzzleType, number>>;
  // NEW: Daily challenge stats
  dailyChallengesCompleted: number;
  dailyStreakRecord: number;
  dailyPerfectStreak: number;      // Consecutive perfect daily wins
}
```

---

## 3. Scene Flow

```
HomeScene
    │
    └──[Daily Challenge Button]──► DailyChallengeScene
                                       │
                                       ├── Shows: Today's puzzle type, modifier, difficulty
                                       ├── Shows: Current streak, best streak
                                       ├── Shows: Rewards preview (coins + streak bonus)
                                       │
                                       └──[Play Button]──► GameScene (with isDaily: true, modifiers)
                                                              │
                                                              ├── Timer applies timeMultiplier
                                                              ├── Wrong moves fail in Precision Mode
                                                              └── Completion grants bonus coins
                                                              
                                                              │
                                                              ▼
                                                         ResultsScene
                                                              │
                                                              ├── Shows daily challenge success
                                                              ├── Shows base coins + streak bonus + modifier bonus
                                                              ├── Shows streak updated
                                                              └── [Home Button]──► HomeScene
```

---

## 4. Implementation Steps (In Order)

### Step 1: Add Types & Configuration
- [ ] Add `DailyModifierType` enum to `types.ts`
- [ ] Add `DailyModifier`, `DailyChallenge`, `DailyCompletion` interfaces
- [ ] Update `DailyState` and `AchievementStats` interfaces
- [ ] Create `src/config/daily.ts` with:
  - Modifier definitions
  - Difficulty scaling by day of week
  - Reward calculations

### Step 2: Update StateManager
- [ ] Update migration function to v6 (handle new DailyState fields)
- [ ] Add `createDefaultDaily()` updates for new fields
- [ ] Add `getDailyChallenge(date: string): DailyChallenge` method
- [ ] Add `completeDailyChallenge(time: number, modifiers: DailyModifier[])` method
- [ ] Add `getDailyRewards(): { base: number; streak: number; modifier: number }` method

### Step 3: Update EventBus
- [ ] Add `'daily:challenge:start'` event
- [ ] Add `'daily:challenge:complete'` event
- [ ] Add `'daily:streak:broken'` event

### Step 4: Create Daily Generator
- [ ] Create `src/data/dailyGenerator.ts`
- [ ] Implement seeded random for deterministic level generation
- [ ] Map day of week to puzzle type rotation
- [ ] Map date to modifier selection
- [ ] Generate level config on-the-fly (not stored)

### Step 5: Create DailyChallengeScene
- [ ] Show today's puzzle type with icon
- [ ] Show active modifiers with icons and descriptions
- [ ] Display difficulty indicator
- [ ] Show current streak and best streak
- [ ] Show rewards preview (base coins + streak bonus)
- [ ] Play button starts the challenge

### Step 6: Update GameScene
- [ ] Apply time multiplier from modifiers
- [ ] Track wrong moves for Precision Mode
- [ ] Fail level immediately on mistake in Precision Mode
- [ ] Pass modifiers to ResultsScene

### Step 7: Update ResultsScene
- [ ] Detect `isDaily` flag
- [ ] Show daily challenge specific UI (streak flame, etc.)
- [ ] Calculate and display: base + streak bonus + modifier bonus
- [ ] Show "Perfect Daily" badge if no mistakes in Precision Mode

### Step 8: Update HomeScene
- [ ] Modify daily button to navigate to DailyChallengeScene
- [ ] Update button state based on completion

### Step 9: Add Daily Challenge Achievements
- [ ] Create `dailyAchievements` in `src/data/dailyAchievements.ts`
- [ ] Add to achievement definitions:
  - "First Daily" - Complete your first daily challenge
  - "Week Warrior" - Complete 7 daily challenges
  - "Daily Dedication" - 30 day streak
  - "Precision Master" - Complete 10 precision mode dailies
  - "Speed Demon" - Complete 10 speed round dailies

---

## 5. Modifier Details

### Speed Round
- **Time multiplier**: 0.6x (60% of normal time)
- **Visual**: Timer pulses red, countdown prominent
- **Difficulty bonus**: +2 difficulty equivalent

### Precision Mode
- **Allowed mistakes**: 0
- **Visual**: "No mistakes allowed!" banner
- **On mistake**: Immediate failure with "Precision Failed!" message
- **Perfect completion badge**: ⭐

### Bonus Coins
- **Coin multiplier**: 1.5x (150% coins)
- **Visual**: Coins icon with sparkle effect
- **Combined**: Can stack with other modifiers

### Rotation Logic
| Day | Puzzle Type | Modifier Pool |
|-----|-------------|----------------|
| Monday | SORT | Speed Round |
| Tuesday | UNTANGLE | Precision Mode |
| Wednesday | PACK | Bonus Coins |
| Thursday | SORT | Speed + Bonus |
| Friday | UNTANGLE | Precision + Bonus |
| Saturday | PACK | Random from pool |
| Sunday | RANDOM | Two random modifiers |

---

## 6. Rewards System

### Base Rewards (by difficulty)
| Difficulty | Base Coins |
|------------|------------|
| 1 | 15 |
| 2 | 20 |
| 3 | 25 |
| 4 | 35 |
| 5 | 50 |

### Streak Bonus
| Streak Days | Bonus Coins |
|-------------|-------------|
| 1-6 | streak × 5 |
| 7-13 | 50 + (streak - 6) × 10 |
| 14-29 | 120 + (streak - 13) × 15 |
| 30+ | 370 + (streak - 29) × 20 |

### Modifier Bonus
| Modifier | Bonus |
|----------|-------|
| Speed Round | +10% coins |
| Precision Mode | +25% coins |
| Bonus Coins | (already included) |

---

## 7. Edge Cases

### Edge Case 1: Missed Day
- **Behavior**: Streak resets to 0
- **UI**: Show "Start fresh!" encouraging message
- **Prevention**: Push notification (future feature)

### Edge Case 2: Multiple Plays Same Day
- **Behavior**: Only first completion counts
- **UI**: Show "Come back tomorrow!" after completion
- **State**: `todayChallengeCompleted` flag prevents double rewards

### Edge Case 3: Device Time Change
- **Behavior**: Use stored date comparison, not system time
- **Protection**: Validate date against last play in StateManager

### Edge Case 4: Offline Play
- **Behavior**: Challenges work offline (deterministic seed)
- **Sync**: When online, validate against server (future)

### Edge Case 5: New Day While Playing
- **Behavior**: Lock daily challenge at start of play session
- **Protection**: Capture today's date at GameScene init

### Edge Case 6: Precision Mode Failure
- **Behavior**: Show encouraging message, no streak penalty
- **UI**: "So close! Try again tomorrow or retry now"
- **Note**: Streak only increments on success

---

## 8. Verification Checklist

- [ ] `bun run lint` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] Daily challenge button navigates correctly
- [ ] Challenge is different each day (verify seed)
- [ ] Streak increments on completion
- [ ] Streak resets on missed day
- [ ] Speed Round reduces time correctly
- [ ] Precision Mode fails on mistake
- [ ] Bonus Coins multiplier applies
- [ ] Combined modifiers work correctly
- [ ] Rewards display correctly in ResultsScene
- [ ] Achievements unlock properly
- [ ] State persists across sessions
