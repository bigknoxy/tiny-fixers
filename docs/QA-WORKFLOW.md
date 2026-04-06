# QA Test Workflow

**Run this test after every code change to catch regressions.**

## Pre-Test Setup

1. Start dev server: `bun run dev --port 3456 --host`
2. Open browser to: http://localhost:3456/tiny-fixers/
3. Open browser DevTools console (F12) - watch for errors

---

## Test 1: First-Time User Experience (FTUE)

### Steps
1. Clear localStorage (DevTools → Application → Local Storage → Clear All)
2. Refresh page
3. Verify TutorialScene appears
4. Complete the tutorial
5. Verify HomeScene loads

### Expected
- Tutorial modal displays correctly
- Can drag items in tutorial
- "Start Playing" button works
- Transitions to HomeScene smoothly

---

## Test 2: Level Play Through (Critical Path)

### Steps
1. From HomeScene, tap any level card
2. Complete the level (or let timer run out)
3. **CRITICAL**: On ResultsScene, verify ALL buttons work:
   - [ ] "Next Level" button (if shown) - should load next level
   - [ ] "Retry" button - should restart same level
   - [ ] "Home" button - should return to HomeScene
4. Repeat for each puzzle type:
   - Sort puzzle (untangle_01, sort_01)
   - Untangle puzzle
   - Pack puzzle

### Expected
- Level loads and is playable
- Stars animate on completion
- Confetti/sparkles display correctly
- **ALL buttons respond to clicks**
- Scene transitions work without freezing

### Regression History
| Date | Issue | Fix |
|------|-------|-----|
| 2026-03-29 | ResultsScene buttons unresponsive | Added `Effects.init(this)` to ResultsScene, reset `this.scene = null` in cleanup() |

---

## Test 3: Untangle Puzzle Specific

### Steps
1. Start any untangle level
2. Drag objects apart until none overlap
3. Verify completion triggers (particles, sounds)
4. **CRITICAL**: Verify ResultsScene buttons work (known issue area)

### Expected
- Objects highlight red when overlapping
- Objects unhighlight when separated
- Completion detection works
- No freeze/lockup on last move
- ResultsScene buttons work

### Regression History
| Date | Issue | Fix |
|------|-------|-----|
| 2026-03-29 | Game freezes on untangle completion | Added `Effects.init(this)` to GameScene |

---

## Test 4: Daily Challenge

### Steps
1. From HomeScene, tap Daily Challenge button
2. Wait for animations to complete (~500ms)
3. Verify DailyChallengeScene shows:
   - Puzzle type
   - Modifiers (if any)
   - Streak info
   - Rewards preview
4. **CRITICAL**: Verify both buttons respond to clicks:
   - [ ] Back button (←) works - returns to HomeScene
   - [ ] "Play Challenge" button works - starts the challenge
5. Complete or fail the challenge
6. Verify ResultsScene shows streak panel
7. Verify buttons work

### Expected
- Daily info displays correctly
- **Both buttons are clickable after animation completes**
- Streak increments on completion
- Modifiers apply (speed, precision, bonus coins)
- ResultsScene shows daily-specific UI

### Regression History
| Date | Issue | Fix |
|------|-------|-----|
| 2026-03-30 | DailyChallengeScene buttons unresponsive | Use explicit hit areas with Phaser.Geom shapes, set interactivity after fade-in animation |

---

## Test 5: Scene Navigation

### Steps
1. HomeScene → Settings → Back to Home
2. HomeScene → Hub → Back to Home
3. HomeScene → Achievements → Back to Home
4. HomeScene → Level Select → Back to Home
5. Play level → ResultsScene → Home

### Expected
- All navigation works
- No console errors
- No memory leaks (check DevTools Memory tab)

---

## Test 6: Daily Challenge Replay Protection

### Steps
1. Complete daily challenge
2. Note coins earned
3. Try to replay daily (via Retry button or re-entering)
4. Check coins didn't increase

### Expected
- Can't earn coins twice for same daily
- UI shows "already completed" state
- Retry button works but doesn't grant duplicate rewards

---

## Test 7: Untangle Level Generation

### Steps
1. Play untangle_01 through untangle_10 (levels 11-20)
2. For each level, observe initial state
3. **CRITICAL**: Verify objects show RED OUTLINE (overlapping) at start
4. Complete each level by separating all objects
5. Test daily challenge when type is untangle
6. Test endless mode untangle at score 0, 10, 20

### Expected
- [ ] All untangle levels start with visible overlap (red outlines)
- [ ] Objects are clustered together, not spread apart
- [ ] Completion detection triggers when all objects separated
- [ ] ResultsScene buttons work after completion

### Regression History
| Date | Issue | Fix |
|------|-------|-----|
| 2026-03-30 | Untangle levels could start non-overlapping | Mathematical cluster radius calculation in generators |

---

## Quick Smoke Test (5 minutes)

For quick validation, run only:

1. **Play one Sort level** → Verify ResultsScene buttons work
2. **Play one Untangle level** → Verify no freeze, buttons work  
3. **Play one Pack level** → Verify ResultsScene buttons work
4. **Test Daily Challenge** → Verify full flow

If any buttons are unresponsive, **STOP and investigate** - this is a critical regression.

---

## Known Issues to Watch For

1. **ResultsScene buttons unresponsive** - Caused by Effects singleton retaining stale scene reference (fixed 2026-03-29)
2. **Untangle freeze on completion** - Caused by missing Effects.init() in GameScene (fixed 2026-03-29)
3. **Untangle levels starting non-overlapping** - Caused by random positioning not guaranteeing overlap (fixed 2026-03-30)
4. **DailyChallengeScene buttons unresponsive** - Caused by setInteractive before popIn scale=0 (fixed 2026-03-30)
5. **Daily replay granting duplicate rewards** - Should be prevented by state checks

---

## Reporting Bugs

When reporting, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser console errors (screenshots)
4. Which test failed from this document
