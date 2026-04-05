# Tiny Fixers - Executive Market Research & Strategic Recommendations

**Prepared by:** Game Studio Executive Review
**Date:** April 2026
**Confidentiality:** Internal Use Only

---

## Executive Summary

Tiny Fixers is a **cozy hybrid-casual puzzle game** built with Phaser 3 + TypeScript, targeting mobile web (PWA) with plans for native app store distribution. The game features 3 puzzle types (Sort, Untangle, Pack), 30 handcrafted levels, an endless mode, a hub restoration meta-layer, daily challenges, and 25 achievements.

**The verdict:** This game has a **strong technical foundation and a smart design philosophy**, but it's currently a polished prototype, not a market-ready product. With targeted investments in audio, visual polish, monetization, and go-to-market strategy, Tiny Fixers can compete in the $9.5B+ puzzle category -- the third-largest mobile genre and one growing 12% YoY.

Below are findings and a prioritized roadmap to take this from "good indie game" to "chart-topping hit."

---

## Part 1: Market Context

### The Opportunity

| Metric | Value | Implication |
|--------|-------|-------------|
| Global mobile gaming revenue (2025) | $81.7B consumer spend / ~$126B total | Massive market, still growing |
| Puzzle genre revenue | $9.5B+ (up 12% YoY) | Third-largest genre, consistently growing |
| Hybrid-casual IAP growth | +37% YoY | The exact model Tiny Fixers is positioned for |
| Merge puzzle revenue growth | +58% YoY | Adjacent subgenre exploding |
| Downloads industry-wide | Down 7.2% | Revenue-per-user matters more than volume |

### Competitive Landscape

| Competitor | What They Do Well | Tiny Fixers' Edge |
|------------|-------------------|-------------------|
| **Royal Match** | Polished meta-layer (king's castle decoration), massive UA budget | Tiny Fixers has a similar hub restoration loop but with a cozier, indie charm |
| **Candy Crush** | Brand recognition, decades of content | Tiny Fixers offers variety (3 puzzle types vs. one) |
| **Merge Mansion** | Narrative + merge mechanics, strong retention | Tiny Fixers can add narrative without the merge-game baggage |
| **Unpuzzle / Untangle** | Clean minimalist puzzles | Tiny Fixers has deeper meta-progression |
| **Sort It 3D** | Satisfying color sorting, TikTok-viral visuals | **Direct competitor** -- Tiny Fixers needs to match or exceed this visual satisfaction |

### Key Market Insight

> **The hybrid-casual lifecycle is real.** Successful titles start with simple mechanics + ads, then evolve: IAP overtakes ad revenue, meta mechanics deepen, and the game becomes a proper casual title. Tiny Fixers should plan for this evolution from day one.

---

## Part 2: Product Audit -- Strengths

### What's Working

1. **Smart puzzle variety.** Three distinct puzzle types (Sort, Untangle, Pack) in one game is a differentiator. Most puzzle games are one-trick ponies. This variety fights content fatigue and broadens appeal.

2. **Solid meta-progression.** The hub restoration system (Flower Shop, Tool Shed) with materials + coins is the exact "hybrid-casual meta-layer" the market is rewarding. This is what separates a $0.01 ARPDAU game from a $0.25+ ARPDAU game.

3. **Daily engagement hooks.** Daily challenges with streak tracking and escalating rewards (20 -> 100 coins over 7 days) are textbook retention mechanics. The exponential reward curve is correct.

4. **Endless mode.** Procedurally generated content with scaling difficulty extends the content runway infinitely. This is critical for long-term retention.

5. **Clean architecture.** TypeScript strict mode, event-driven design, modular scene system, singleton state management -- this codebase is built to scale. Adding new puzzle types, levels, or features won't require rewrites.

6. **PWA-first approach.** Smart for an indie: zero UA cost for initial distribution, instant play (no app store friction), and a path to native via TWA/PWA Builder.

7. **Achievement system.** 25 achievements across 5 categories give completionists something to chase. Well-designed conditions tied to real gameplay milestones.

---

## Part 3: Product Audit -- Critical Gaps

### P0: Ship-Blocking Issues

#### 1. No Audio (Framework Only)
- **Impact:** SEVERE. Audio is not optional for a casual puzzle game. Satisfying sound effects are responsible for up to 30% of the "juice" that makes puzzle games feel rewarding and shareable.
- **What's needed:**
  - Satisfying "pop/click" SFX for every drag-drop action
  - Ascending tone combos for consecutive correct placements
  - Celebratory fanfare on level completion (with star-tier variants)
  - Gentle ambient background music per scene (loopable, 60-90 BPM)
  - UI interaction sounds (button press, menu transition)
- **Benchmark:** Sort It 3D's audio design -- every ball drop has a satisfying "clink" that triggers ASMR-like satisfaction.

#### 2. No Real Art Assets (Programmatic Shapes Only)
- **Impact:** SEVERE. The game currently renders colored geometric shapes. In a market where Royal Match and Merge Mansion have AAA-quality 2D art, programmatic shapes won't retain players past D1.
- **What's needed:**
  - Themed sprite sheets for each puzzle type (e.g., sorting colored bottles, untangling garden hoses, packing suitcases)
  - Character sprites for the hub (the "Tiny Fixers" characters who restore locations)
  - Hub location artwork (before/after states for each upgrade stage)
  - Animated transitions and celebrations
- **Budget option:** AI-generated 2D assets refined by an artist. This is increasingly common and can cut art costs 60-80%.

#### 3. No Monetization Implementation
- **Impact:** CRITICAL for sustainability. The game is free with zero revenue.
- **Recommended launch monetization stack:**

| Feature | Priority | Expected Impact |
|---------|----------|-----------------|
| **Rewarded video ads** (double coins, free continue) | P0 | 45-60% engagement rate, primary early revenue |
| **Battle pass** (seasonal, ~$4.99) | P0 | 15-20% conversion, 3x retention lift for purchasers. **Single highest-impact monetization feature.** |
| **Remove ads IAP** ($2.99-4.99) | P1 | One-time purchase for whales who hate ads |
| **Cosmetic IAP** (character skins, themes) | P1 | Low ARPDAU but high margin, no pay-to-win risk |
| **Coin/material packs** | P2 | Progression accelerators for impatient players |

---

### P1: Launch-Critical Improvements

#### 4. Content Volume Is Too Low
- **30 levels is not enough.** Top puzzle games launch with 100-500+ levels. Players who enjoy the game will burn through 30 levels in 1-2 sessions.
- **Recommendation:**
  - Launch with **100+ handcrafted levels** (expand each puzzle type to 30-35)
  - Lean heavily on the endless mode as a content bridge
  - Add a **level editor / procedural generation pipeline** to ship 10-20 new levels per week post-launch
  - Consider the 4 planned puzzle types (Match-3, Slide, Stack, Connect) -- ship at least 1-2 of these at launch for variety

#### 5. No Onboarding Funnel Optimization
- **The first 60 seconds determine D1 retention.** Current tutorial system exists but needs:
  - A "wow moment" in the first 10 seconds (e.g., an extremely satisfying, near-impossible-to-fail first level)
  - Skip-able but not skip-encouraged tutorials
  - Progressive disclosure of meta features (don't show the hub until level 3-5)
  - First session should guarantee a hub upgrade to hook the meta loop

#### 6. No Analytics Integration
- **You can't improve what you can't measure.** The event bus is ready but no external analytics.
- **Minimum viable analytics:**
  - Firebase Analytics (free) or Amplitude (free tier)
  - Track: D1/D7/D30 retention, level completion rates, funnel drop-offs, session length, monetization events
  - A/B testing framework for difficulty curves and reward balancing
- **Target benchmarks:**
  - D1 retention: 40%+ (casual median is 22%, but top 10% hit 40%)
  - D7 retention: 20%+
  - D30 retention: 10%+

#### 7. Star Thresholds Are Too Generous
- **Current:** 1-star at 20%, 2-star at 50%, 3-star at 80%
- **Problem:** If everyone 3-stars every level, there's no reason to replay. Stars should create aspiration.
- **Recommended:** 1-star at 40%, 2-star at 65%, 3-star at 90%
- Also: tie hub unlock requirements to stars more aggressively to create a "go back and perfect earlier levels" loop

---

### P2: Post-Launch Growth Features

#### 8. Social Features & Virality
- **Leaderboards** (daily/weekly/all-time for endless mode)
- **Share cards** -- auto-generated images showing level completion + stars for social sharing
- **Friend challenges** -- send a level to a friend, compare scores
- **Community events** -- weekly themed challenges with exclusive cosmetic rewards

#### 9. Live-Ops Calendar
- **Seasonal events** every 4-6 weeks (Spring Garden, Summer Beach, Halloween Workshop, Winter Wonderland)
- **Limited-time puzzle modes** (speed run week, no-mistake challenge)
- **Battle pass seasons** aligned with events
- **New hub locations** quarterly (drives long-term progression)

#### 10. Localization
- **Priority markets:** English, Spanish, Portuguese, Japanese, Korean, German, French
- **The game is almost entirely UI text** -- localization cost is minimal but impact on global reach is massive
- Puzzle games are inherently language-agnostic in gameplay, making this a low-effort/high-reward investment

---

## Part 4: Go-To-Market Strategy

### Phase 1: Soft Launch (Weeks 1-4)
- **Platform:** PWA only (Android Chrome primary)
- **Markets:** Philippines, Brazil, Indonesia (low CPI, high mobile gaming population)
- **Goal:** Validate D1/D7 retention, identify funnel drop-offs, tune difficulty
- **Budget:** $0 (organic + PWA distribution)

### Phase 2: Content & Polish (Weeks 5-8)
- Fix all issues identified in soft launch analytics
- Expand to 100+ levels
- Implement audio + art assets
- Add rewarded ads + battle pass
- Integrate analytics SDK

### Phase 3: Global Launch (Weeks 9-12)
- **Play Store:** TWA wrapper via Bubblewrap (the PWA already supports this)
- **App Store:** Consider Capacitor or similar web-to-native wrapper
- **UA Strategy:**

| Channel | Budget | Expected CPI | Notes |
|---------|--------|--------------|-------|
| **TikTok organic** | $0 | Free | Post 7-14 clips/week of satisfying sort/untangle gameplay. This is the #1 channel for indie puzzle games. |
| **TikTok paid (boost)** | $200/week | $0.10-0.50 | Boost any organic video that gets 10K+ views |
| **YouTube Shorts** | $0 | Free | Repurpose TikTok content |
| **Instagram Reels** | $0 | Free | Repurpose TikTok content |
| **Google UAC** | $500-1000/week | $0.14-0.63 (Android) | Only after retention metrics are proven |
| **Cross-promotion** | $0 | Free | Partner with other indie devs for in-game cross-promo |

### Phase 4: Scale (Month 4+)
- Launch iOS version
- Ramp paid UA based on ROAS data
- Introduce subscription tier ($1.99/month VIP)
- First seasonal event + battle pass season
- Community features rollout

---

## Part 5: The "TikTok-Native" Opportunity

This is the single most important strategic recommendation:

> **Tiny Fixers' Sort puzzle is inherently TikTok-viral.** Color sorting games are among the most-watched mobile game content on TikTok. But the game needs visual upgrades to capitalize on this.

### What Makes Sort Content Go Viral
1. **Satisfying color resolution** -- watching chaotic mixed colors resolve into perfect sorted bins
2. **ASMR-quality audio** -- each item placement needs a crisp, satisfying sound
3. **Visual juice** -- particle effects, screen shake, color bloom on completion
4. **Speed** -- fast-paced sorting with a visible timer creates tension
5. **Near-misses** -- almost running out of time, last-second wins

### Action Items for TikTok Virality
- [ ] Add themed items to Sort puzzle (colored liquids in bottles, gems in chests, etc.)
- [ ] Implement "oddly satisfying" completion animations (items settling, colors pulsing)
- [ ] Add a screen recording / share button that exports a 15-second clip
- [ ] Create a "spectator mode" camera angle optimized for vertical video
- [ ] Design 5-10 "TikTok bait" levels that are visually spectacular when solved

---

## Part 6: Revenue Projections (Conservative)

Assuming successful execution of the above roadmap:

| Timeframe | DAU | ARPDAU | Monthly Revenue | Notes |
|-----------|-----|--------|-----------------|-------|
| Month 1 (soft launch) | 500-1K | $0.00 | $0 | Validation phase |
| Month 3 (global launch) | 5K-10K | $0.05-0.10 | $7.5K-30K | Rewarded ads only |
| Month 6 | 20K-50K | $0.10-0.20 | $60K-300K | Ads + battle pass + IAP |
| Month 12 | 50K-200K | $0.15-0.25 | $225K-1.5M | Full monetization, scaled UA |

**Break-even target:** 10K DAU at $0.10 ARPDAU = $1K/day = $30K/month

---

## Part 7: Prioritized Roadmap

### Sprint 1 (Now - Week 2): Audio & Visual Foundation
- [ ] Source/create SFX library (20-30 sounds)
- [ ] Add background music tracks (3-5 loops)
- [ ] Design themed art direction for Sort puzzle (colored liquids or similar)
- [ ] Integrate Firebase Analytics

### Sprint 2 (Week 3-4): Monetization & Content
- [ ] Implement rewarded video ads (AdMob)
- [ ] Build battle pass system (10-tier, free + premium track)
- [ ] Expand to 50+ levels (focus on Sort as primary viral mechanic)
- [ ] Tighten star thresholds and economy balance

### Sprint 3 (Week 5-6): Polish & Soft Launch
- [ ] Optimize first-time user experience (FTUE)
- [ ] Add share functionality (screenshot + link)
- [ ] Soft launch in 2-3 test markets
- [ ] Begin TikTok content creation (2 clips/day)

### Sprint 4 (Week 7-8): Iterate on Data
- [ ] Analyze soft launch retention data
- [ ] A/B test difficulty curves
- [ ] Fix top 3 funnel drop-off points
- [ ] Expand to 100+ levels

### Sprint 5 (Week 9-12): Global Launch
- [ ] Play Store submission (TWA)
- [ ] App Store submission
- [ ] Launch battle pass Season 1
- [ ] Scale TikTok content + begin paid UA
- [ ] First seasonal event

---

## Final Verdict

**Tiny Fixers has the bones of a hit.** The architecture is clean, the design philosophy is sound, and it's positioned in a growing $9.5B market segment. What it needs now is:

1. **Sensory polish** -- Audio and art are non-negotiable. Players feel games before they think about them.
2. **Content depth** -- 30 levels won't sustain a D7 metric. Triple the content minimum.
3. **Monetization from day one** -- Rewarded ads + battle pass. No excuses.
4. **TikTok-first marketing** -- The Sort puzzle is a viral goldmine waiting to be filmed. Invest in making it visually spectacular.
5. **Data-driven iteration** -- Ship analytics before you ship the game. Every decision post-launch should be backed by retention data.

The cozy, character-driven, multi-puzzle hybrid-casual formula is exactly what the market is rewarding right now. Execute on the roadmap above and this game has a real shot at breaking into the top charts.

---

*"The best mobile games aren't the most complex -- they're the most satisfying." -- Every top studio's design philosophy*
