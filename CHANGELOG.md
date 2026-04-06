# Changelog

## [1.8.0](https://github.com/bigknoxy/tiny-fixers/compare/v1.7.0...v1.8.0) (2026-04-06)

### Features

* Enhanced all 10 SFX with layered synthesis (harmonics, noise bursts, vibrato)
* Added 4 procedural background music loops (home, sort, untangle, pack)
* Glass-effect sort bins with stacking animation and idle float
* Untangle puzzle connection lines with separation feedback
* Pack puzzle ghost preview with corner brackets and inner grid
* Expanded from 30 to 120 levels via deterministic seeded generator
* 3 new worlds: Mixed Mastery, Expert Challenge, Master Collection
* 2 new hub locations: Bakery (50 stars), Library (100 stars)
* Battle pass system (30-tier, event-driven persistence)
* Ad manager scaffold (no-op, ready for SDK integration)
* Analytics framework (EventBus subscriber, queue-based)
* Share manager (Web Share API + clipboard fallback)
* Live-ops framework (seasonal events with multipliers)
* i18n framework with English string extraction
* Compressed tutorial 5 to 3 steps, routes to sort_01 directly
* First-completion neighborhood preview meta hook
* Fixed star threshold config/code mismatch, set 0.3/0.6/0.85
* New achievements: Half Century, Star Hoarder

### Bug Fixes

* SoundGenerator fallback buffer silent audio bug
* WAV encoder sample rate mismatch
* GameScene shutdown memory leak (puzzle never destroyed)
* BattlePass circular dependency, initialization, and persistence
* AudioManager sound object accumulation across scene transitions
* PackPuzzle placed-item drag soft-lock
* HomeScene button y-offset drift
* UntanglePuzzle duplicate O(n2) checks merged into single pass
* SortPuzzle hacky bounds calculation and float tween position drift
* Removed stale hub.ts ACHIEVEMENTS export
