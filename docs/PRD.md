# Tiny Fixers - Product Requirements Document

## Overview
**Game Title:** Tiny Fixers  
**Platform:** Mobile Web PWA (future: Google Play wrapper)  
**Genre:** Hybrid-casual puzzle  
**Orientation:** Portrait only  
**Control:** One-thumb touch  

## Vision
Create a lightweight, instantly playable mobile game with satisfying micro-puzzles and meaningful meta-progression that keeps players returning daily for weeks.

---

## Core Gameplay

### Puzzle Families (3 Types)

#### 1. Sort Puzzle
- **Mechanic:** Drag objects into correct bins/slots
- **Examples:** 
  - Sort colored balls into matching bins
  - Organize tools by type
  - Match shapes to outlines
- **Win Condition:** All items correctly sorted
- **Scoring:** Time + accuracy (fewer wrong drops = more stars)

#### 2. Untangle Puzzle
- **Mechanic:** Drag overlapping objects apart
- **Examples:**
  - Separate tangled earbuds/wires
  - Pull apart stacked items
  - Unstack messy piles
- **Win Condition:** No objects touching
- **Scoring:** Time + moves efficiency

#### 3. Pack Puzzle
- **Mechanic:** Slide objects into constrained spaces
- **Examples:**
  - Fit groceries into a bag
  - Pack boxes efficiently
  - Arrange furniture in a room
- **Win Condition:** All items placed within bounds
- **Scoring:** Time + space efficiency

### Level Structure
- **Duration:** 20-40 seconds per level
- **Scoring:** 1-3 stars based on performance
- **Difficulty Curve:** Gentle ramp over 30 levels
- **Starter Content:** 30 handcrafted levels (10 per family)

---

## Meta Progression

### Restoration Hub
- **Concept:** Restore a tiny neighborhood street
- **Progression:** 
  - 2 upgradeable locations (Flower Shop, Tool Shed)
  - Each location has 3 restoration stages
  - Completing levels earns materials and coins
- **Rewards:**
  - Unlocks new character helpers
  - Cosmetic decorations
  - New puzzle set access

### Currency System
- **Soft Currency:** Coins
  - Earned from level completion
  - Used for restoration purchases
  - Bonus from stars and streaks
- **Materials:** Wood, Bricks, Paint
  - Level-specific drops
  - Required for restoration stages

### Collection Book
- Unlocked characters with descriptions
- Decoration catalog
- Achievement tracking

---

## Retention Features

### Daily System
- **Daily Challenge:** One rotating puzzle per day
- **7-Day Streak:** Increasing rewards
- **Daily Reward Track:** Cosmetic unlocks

### Achievements
- First level complete
- 10/30/50 levels complete
- All stars collected
- 7-day streak
- Hub fully restored

---

## Economy Design

### Reward Cadence (v1 - Soft Currency Only)
| Action | Reward |
|--------|--------|
| Level Complete | 10-30 coins |
| 3-Star Bonus | +10 coins |
| Daily Challenge | 50 coins |
| Streak Day 1-3 | 20-40 coins |
| Streak Day 4-7 | 50-100 coins + cosmetic |

### Future Hooks
- Rewarded ad bonus (placeholder)
- Cosmetic IAP (placeholder)
- No pay-to-win mechanics

---

## User Experience

### Screens
1. **Home Screen** - Play button, daily challenge, settings, hub access
2. **Level Map** - Visual progression, level selection
3. **Game HUD** - Timer, score, pause
4. **Results Screen** - Stars, rewards, retry/next
5. **Hub Screen** - Restoration view, shop, collection
6. **Settings** - Audio, haptics, reset

### UI Requirements
- Touch-first with large hit targets (min 44px)
- Safe area support for notched devices
- Accessible contrast ratios (WCAG AA)
- Readable fonts (min 16px body)
- Clear visual feedback on all interactions

---

## Technical Requirements

### Performance Targets
- 60 FPS on mid-range Android
- First load under 3 seconds on 3G
- Bundle size under 2MB gzipped
- Memory footprint under 100MB

### PWA Features
- Installable on home screen
- Offline gameplay shell
- Cached core assets
- Background/foreground state handling
- Splash screen support

### Platform Support
- Chrome Android (primary)
- Safari iOS (secondary)
- Desktop Chrome/Firefox (functional)

---

## Art Direction

### Visual Style
- Clean, flat 2D graphics
- Bright, cheerful color palette
- Whimsical character designs
- Minimal UI with clear affordances

### Asset Strategy
- Reusable shape primitives
- Icon-based objects
- Particle effects for juice
- CSS/Phaser hybrid UI where appropriate

---

## Success Metrics
- Day 1 retention > 30%
- Day 7 retention > 10%
- Average session length 5-10 minutes
- 60% of players complete first 10 levels
- 20% engage with daily challenge

---

## Non-Goals (v1)
- Multiplayer
- Backend/sync
- Real-money purchases
- Localization
- Heavy animations/cutscenes
