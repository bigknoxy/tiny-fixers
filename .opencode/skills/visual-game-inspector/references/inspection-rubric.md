# Inspection Rubric

Systematic criteria for visual game inspection.

## 1. First-Load Experience

### 1.1 Loading State
| Criterion | Pass | Fail |
|-----------|------|------|
| Loading indicator visible | Clear progress/spinner shown | Blank screen or frozen |
| Loading time acceptable | Interactive in <3s on 3G | >5s with no feedback |
| Skeleton/placeholder | Content areas shown | Nothing visible until full load |
| Error handling | Clear retry option | Silent failure or crash |

### 1.2 Initial State
| Criterion | Pass | Fail |
|-----------|------|------|
| First screen clear | Purpose immediately visible | Confusing or empty |
| Primary action prominent | CTA stands out | Lost among other elements |
| Branding present | Logo/name visible | No identity shown |
| Legal compliance | Privacy/age gate if required | Missing required gates |

### 1.3 Performance Perception
| Criterion | Pass | Fail |
|-----------|------|------|
| Perceived speed | Feels fast | Feels sluggish |
| Progressive reveal | Content appears progressively | All-or-nothing load |
| Interaction readiness | Can interact before full load | Blocked until complete |

## 2. Gameplay Clarity

### 2.1 Core Loop
| Criterion | Pass | Fail |
|-----------|------|------|
| Objective visible | Goal clearly stated or shown | Unclear what to do |
| Actions discoverable | Controls intuitive or labeled | Must guess controls |
| Feedback immediate | Response to input is instant | Delayed or missing feedback |
| Progress visible | Score/level/progress shown | No progress indicator |

### 2.2 Controls
| Criterion | Pass | Fail |
|-----------|------|------|
| Input method clear | Touch/keyboard obvious | Unclear how to play |
| Touch targets sized | Min 44x44px | Targets too small |
| Control feedback | Visual/audio on input | No feedback on action |
| Control consistency | Same action, same result | Inconsistent behavior |

### 2.3 Game State
| Criterion | Pass | Fail |
|-----------|------|------|
| Current state visible | Score, lives, level shown | State hidden |
| State changes highlighted | Animations/color on change | Silent state changes |
| Pause/resume available | Can pause game | No pause option |
| Save indication | Progress saved shown | Unknown if saved |

## 3. Mobile Usability

### 3.1 Viewport
| Criterion | Pass | Fail |
|-----------|------|------|
| No horizontal scroll | Content fits width | Horizontal overflow |
| Proper scaling | No pinch-to-zoom needed | Requires zoom to use |
| Safe area respected | Not under notch/home | Content in system areas |
| Keyboard handling | View adjusts for input | Keyboard covers inputs |

### 3.2 Touch Interaction
| Criterion | Pass | Fail |
|-----------|------|------|
| Tap targets sized | Min 44x44px | Smaller than 44px |
| Tap targets spaced | Min 8px between | Targets touch each other |
| Gesture support | Swipe/pinch where expected | Missing expected gestures |
| Touch feedback | Visual response on touch | No touch confirmation |

### 3.3 Orientation
| Criterion | Pass | Fail |
|-----------|------|------|
| Portrait supported | Works in portrait | Broken in portrait |
| Landscape supported | Works in landscape | Broken in landscape |
| Orientation prompt | Clear message if locked | Broken layout in wrong mode |
| Content preserved | No loss on rotate | Content lost/displaced |

## 4. Visual Hierarchy

### 4.1 Information Architecture
| Criterion | Pass | Fail |
|-----------|------|------|
| Primary action first | Main CTA most prominent | Secondary actions dominate |
| Scan order natural | F-pattern or center-out | Random visual order |
| Grouping logical | Related items together | Scattered related content |
| White space adequate | Breathing room between | Cramped layout |

### 4.2 Visual Prominence
| Criterion | Pass | Fail |
|-----------|------|------|
| Size hierarchy | Important = larger | All same size |
| Color hierarchy | Important = contrasting | No color differentiation |
| Position hierarchy | Important = top/center | Important buried |
| Motion hierarchy | Important = animated | Everything animated or nothing |

### 4.3 Typography
| Criterion | Pass | Fail |
|-----------|------|------|
| Readable size | Min 16px body text | Text too small |
| Contrast sufficient | 4.5:1 minimum ratio | Low contrast text |
| Font appropriate | Readable, game-appropriate | Decorative unreadable fonts |
| Hierarchy clear | Headers distinct from body | No text hierarchy |

## 5. Polish

### 5.1 Consistency
| Criterion | Pass | Fail |
|-----------|------|------|
| Style consistent | Unified visual language | Mixed styles |
| Spacing consistent | Grid/rhythm visible | Random spacing |
| Icons consistent | Same style throughout | Mixed icon sets |
| Button styles | Same type = same look | Inconsistent buttons |

### 5.2 Assets
| Criterion | Pass | Fail |
|-----------|------|------|
| Image quality | Sharp, not pixelated | Blurry or stretched |
| Aspect ratios | Not distorted | Stretched images |
| File sizes | Optimized for web | Oversized files |
| Fallbacks | Placeholder if missing | Broken images |

### 5.3 Animation
| Criterion | Pass | Fail |
|-----------|------|------|
| Purpose clear | Animations guide attention | Gratuitous animation |
| Performance smooth | 60fps | Janky or choppy |
| Duration appropriate | Not too long/short | Feels wrong length |
| Reduced motion | Respects preference | Ignores setting |

## 6. Retention Cues

### 6.1 Progress Systems
| Criterion | Pass | Fail |
|-----------|------|------|
| Progress visible | Bars/numbers/levels | No progress shown |
| Achievements | Badges/trophies visible | No achievement display |
| Stats tracked | Stats page available | No stats visible |
| Streaks/records | Shown prominently | Hidden or absent |

### 6.2 Reward Visibility
| Criterion | Pass | Fail |
|-----------|------|------|
| Rewards animated | Celebration on earn | Silent reward |
| Currency visible | Coins/gems shown | Currency hidden |
| Unlockables | Next unlock teased | No preview of future |
| Collection | Items to collect shown | No collection display |

### 6.3 Return Triggers
| Criterion | Pass | Fail |
|-----------|------|------|
| Daily rewards | Incentive to return | No daily incentive |
| Notifications | Opt-in available | No notification system |
| Suspense | Teased future content | Nothing to look forward to |
| Social proof | Others playing shown | Appears empty/abandoned |

## Scoring

Calculate overall score:
- Critical: -10 points each
- High: -5 points each
- Medium: -2 points each
- Low: -1 point each

**Rating Scale**:
- 90-100: Excellent
- 70-89: Good
- 50-69: Needs Work
- 0-49: Poor
