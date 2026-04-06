# Daily Challenge Test Plan

## Issues Found & Fixed

### Issue #1: LevelSelectScene Welcome Panel Frozen
**Severity:** High  
**Status:** ✅ FIXED

**Symptom:** After completing tutorial, grey transparent overlay appeared and level select didn't start correctly.

**Root Cause:** `LevelSelectScene` was missing `Effects.init(this)` in `create()` method, causing:
- `Effects.popIn()` animation to fail silently (returns early when `this.scene` is null)
- Welcome panel overlay appearing broken/non-interactive

**Fix:** Added `Effects.init(this)` to `LevelSelectScene.create()` at line 37.

**File:** `src/scenes/LevelSelectScene.ts:37`

---

### Issue #2: Daily Challenge Button Not Working
**Severity:** Critical  
**Status:** ✅ FIXED

**Symptom:** Clicking "Daily Challenge" button on home page did nothing or caused errors.

**Root Cause:** `DailyChallengeScene` was missing an `init()` method to handle the `alreadyCompleted` flag:
1. `GameScene.init()` (line 53) checks `StateManager.getTodayChallengeCompleted()`
2. If true, redirects to `DailyChallengeScene` with `{ alreadyCompleted: true }`
3. `DailyChallengeScene` didn't have `init()` to receive this parameter
4. Scene tried to generate daily level even when completed, causing undefined behavior

**Fix:**
1. Added `init(data: { alreadyCompleted?: boolean } = {})` method
2. Added `private alreadyCompleted: boolean` property  
3. Updated `createPlayButton()` to check both sources: `StateManager.getTodayChallengeCompleted() || this.alreadyCompleted`
4. Added guard in button click handler to prevent starting challenge when completed

**Files:** `src/scenes/DailyChallengeScene.ts:14-16, 241`

---

## Test Coverage

### Manual Test Scenarios

#### Test 1: Daily Challenge - First Play (Not Completed)
**Steps:**
1. Navigate to home page
2. Click "Daily Challenge" button
3. Verify DailyChallengeScene loads with puzzle info
4. Click "Play Challenge" button
5. Verify GameScene starts with daily level data

**Expected:**
- DailyChallengeScene displays today's puzzle type, modifiers, streak info
- "Play Challenge" button is enabled (CORAL color)
- Clicking starts the daily challenge in GameScene

---

#### Test 2: Daily Challenge - Already Completed Today
**Steps:**
1. Complete daily challenge
2. Return to home page
3. Click "Daily Challenge" button
4. Verify DailyChallengeScene shows "Done for today! ✓"
5. Click "Come Back Tomorrow" button

**Expected:**
- DailyChallengeScene displays with disabled button (SAGE color)
- Button text shows "Come Back Tomorrow"
- Clicking does NOT start a new game
- Back button returns to HomeScene

---

#### Test 3: Daily Challenge - State Persistence
**Steps:**
1. Complete daily challenge
2. Refresh browser page
3. Navigate to Daily Challenge from home

**Expected:**
- State persists after refresh
- Daily challenge still shows as completed
- Cannot replay until next day

---

### Automated Test Cases (To Implement)

```typescript
// tests/daily-challenge.test.ts
describe('DailyChallengeScene', () => {
  test('loads daily challenge info correctly', async () => {
    // Verify puzzle type, modifiers, streak display
  });

  test('prevents replay after completion', async () => {
    // Mark as completed, verify button disabled
  });

  test('handles alreadyCompleted flag from GameScene', async () => {
    // Redirect from GameScene with alreadyCompleted=true
    // Verify scene handles it gracefully
  });

  test('daily challenge generates same level for same day', async () => {
    // Seed-based generation should be deterministic per day
  });
});
```

---

## Regression Tests

Run these after any DailyChallengeScene changes:

1. **Tutorial → Level Select Flow**
   - Complete tutorial
   - Verify "Start Playing!" button works
   - Verify LevelSelectScene loads without grey overlay

2. **Home → Daily Challenge Flow**
   - From home page, click Daily Challenge
   - Verify scene transitions smoothly
   - Verify all UI elements render

3. **GameScene → DailyChallengeScene Redirect**
   - Complete daily challenge
   - Get redirected back to DailyChallengeScene
   - Verify scene shows completed state
   - Verify cannot replay

---

## Files Modified

- `src/scenes/LevelSelectScene.ts` - Added `Effects.init(this)`
- `src/scenes/DailyChallengeScene.ts` - Added `init()` method and `alreadyCompleted` handling

---

## Verification Checklist

- [x] `bun run typecheck` passes
- [x] `bun run lint` passes
- [x] `bun run build` succeeds
- [x] Deployed to production
- [ ] Manual test: Daily Challenge button works from home page
- [ ] Manual test: Daily Challenge shows completed state correctly
- [ ] Manual test: Cannot replay completed daily challenge
- [ ] Manual test: Tutorial → Level Select flow works

---

## Notes

- Daily challenge uses seed-based generation for deterministic daily levels
- State is persisted via localStorage through StateManager
- `todayChallengeCompleted` flag resets at midnight local time
- Modifiers affect time limit, precision mode, and bonus coins
