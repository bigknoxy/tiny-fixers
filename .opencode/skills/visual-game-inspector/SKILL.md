---
name: visual-game-inspector
description: Inspects games visually and provides expert level feedback
license: MIT
compatibility:
  - opencode
  - claude
metadata:
  version: "1.0.0"
  author: TinyFixers
  tags:
    - games
    - visual-inspection
    - mobile
    - qa
    - ux
---

# Visual Game Inspector

Visually inspect a mobile web game, browser game, or PWA and provide structured expert feedback.

## When to Use

Use this skill when:
- Reviewing a live game URL or screenshots of a game
- Evaluating mobile web games, browser games, or PWAs
- Assessing first-time-player experience (FTPE)
- Identifying visual, UX, and usability issues
- Performing mobile-first game QA

## Inspection Priorities

Inspect in this order:

1. **First-Load Experience**: Initial load time, loading states, error handling, first meaningful interaction
2. **Gameplay Clarity**: Core loop visibility, controls discoverability, objective clarity, feedback systems
3. **Mobile Usability**: Touch targets, viewport behavior, orientation handling, input responsiveness
4. **Visual Hierarchy**: Information architecture, call-to-action prominence, visual noise
5. **Polish**: Consistency, spacing, typography, asset quality, animations
6. **Retention Cues**: Progress indicators, rewards visibility, return triggers

## Workflow

### Screenshot-Only Review

1. Receive screenshots (prefer multiple viewports)
2. Identify viewport dimensions from image dimensions
3. Apply inspection rubric systematically
4. Document observations with direct evidence only
5. Separate observation from inference explicitly
6. Generate structured report

### Live URL Review

1. Run Playwright capture script:
   ```bash
   node .opencode/skills/visual-game-inspector/scripts/capture-playwright.mjs <URL> [output-dir]
   ```
2. Review generated screenshots across all viewports
3. Analyze console logs, page errors, and failed requests
4. Apply inspection rubric to each screenshot
5. Use Python helper to generate starter report:
   ```bash
   python .opencode/skills/visual-game-inspector/scripts/summarize-findings.py <summary-json-path>
   ```
6. Complete the report with expert analysis

## Reference Files

- `references/inspection-rubric.md` - Detailed criteria for each inspection area
- `references/mobile-game-ux-checklist.md` - Mobile-specific UX verification
- `references/chrome-devtools-checklist.md` - DevTools-based inspection steps
- `references/report-template.md` - Structured report format

## Report Format

Every finding must include:

| Field | Description |
|-------|-------------|
| **Severity** | Critical / High / Medium / Low |
| **Category** | First-Load / Gameplay / Mobile / Visual / Polish / Retention |
| **Evidence** | Direct observation (screenshot reference, console log, timing) |
| **Impact** | Effect on player experience |
| **Recommendation** | Specific, actionable fix |
| **Confidence** | High / Medium / Low |

### Evidence Standards

- **Direct Evidence**: Visible in screenshot, logged in console, measured timing
- **Inferred Evidence**: Marked as inference with supporting direct evidence
- **No Speculation**: If uncertain, state "Needs verification" with low confidence

## Output Format

```markdown
# Visual Inspection Report

**Game**: [Name or URL]
**Date**: [ISO date]
**Inspector**: visual-game-inspector
**Viewports Tested**: [list dimensions]

## Executive Summary
[2-3 sentence overview of critical findings]

## Findings

### [Category Name]

#### Finding: [Title]
- **Severity**: [level]
- **Evidence**: [direct observation]
- **Impact**: [player experience effect]
- **Recommendation**: [specific action]
- **Confidence**: [level]

## Artifacts
- Screenshots: [paths]
- Console Logs: [path or summary]
- Network Issues: [path or summary]
```

## Mobile-First Principles

- Assume mobile viewport is primary
- Test smallest viewport first (360x640)
- Verify touch targets meet 44x44px minimum
- Check landscape/portrait behavior
- Validate one-handed reachability
- Assess thumb-zone placement for primary actions

## First-Time Player Experience Focus

- Can a new player understand the game within 5 seconds?
- Is the core action obvious without tutorial?
- Are controls discoverable through visual cues?
- Does the game provide immediate feedback on first interaction?
- Is progress visible from the start?

## Limitations

- Cannot verify backend functionality directly
- Audio inspection requires manual verification
- Touch feel cannot be fully assessed from screenshots
- Performance metrics require live testing beyond page load
