#!/usr/bin/env python3
"""
Summarize visual inspection findings from summary.json into a starter markdown report.
"""

import json
import sys
from pathlib import Path
from datetime import datetime


def load_summary(summary_path: str) -> dict:
    """Load the summary.json file."""
    path = Path(summary_path)
    if not path.exists():
        raise FileNotFoundError(f"Summary file not found: {summary_path}")

    with open(path, "r") as f:
        return json.load(f)


def generate_report(summary: dict, output_path: str) -> str:
    """Generate a markdown report from the summary."""

    url = summary.get("url", "Unknown")
    timestamp = summary.get("timestamp", datetime.now().isoformat())

    viewports = summary.get("viewports", [])
    console_logs = summary.get("consoleLogs", [])
    page_errors = summary.get("pageErrors", [])
    failed_requests = summary.get("failedRequests", [])
    screenshots = summary.get("screenshots", [])

    error_count = sum(1 for log in console_logs if log.get("type") == "error")
    warn_count = sum(1 for log in console_logs if log.get("type") == "warn")

    viewport_list = ", ".join(v["name"] for v in viewports if "error" not in v)

    report = f"""# Visual Inspection Report

**Game**: [Game Name]
**URL**: {url}
**Date**: {timestamp[:10]}
**Inspector**: visual-game-inspector
**Version**: 1.0.0

---

## Metadata

| Field | Value |
|-------|-------|
| Platform | [Web / PWA / Mobile Web] |
| Viewports Tested | {viewport_list} |
| Primary Viewport | [Mobile / Tablet / Desktop] |
| Inspection Type | Live URL |

---

## Executive Summary

[2-3 sentences summarizing overall quality and most critical issues. Be specific about what works well and what needs immediate attention.]

**Overall Score**: [0-100] / 100

**Critical Issues**: 0
**High Issues**: 0
**Medium Issues**: 0
**Low Issues**: 0

---

## Technical Summary

### Capture Results

| Viewport | Status | Logs | Errors | Failed Requests |
|----------|--------|------|--------|-----------------|
"""

    for vp in viewports:
        if "error" in vp:
            report += f"| {vp['name']} | ERROR: {vp['error'][:30]} | - | - | - |\n"
        else:
            report += f"| {vp['name']} | {vp['status']} | {vp['logs']} | {vp['errors']} | {vp['failures']} |\n"

    report += f"""
### Console Summary

- **Errors**: {error_count}
- **Warnings**: {warn_count}
- **Total Messages**: {len(console_logs)}

### Page Errors: {len(page_errors)}

### Failed Requests: {len(failed_requests)}

---

## Findings

### First-Load Experience

[Add findings based on screenshot review]

---

### Gameplay Clarity

[Add findings based on screenshot review]

---

### Mobile Usability

[Add findings based on screenshot review]

---

### Visual Hierarchy

[Add findings based on screenshot review]

---

### Polish

[Add findings based on screenshot review]

---

### Retention Cues

[Add findings based on screenshot review]

---

## Positive Observations

1. [Positive observation with evidence]
2. [Positive observation with evidence]
3. [Positive observation with evidence]

---

## Technical Notes

### Console Errors
```
"""

    errors_only = [log for log in console_logs if log.get("type") == "error"]
    if errors_only:
        for err in errors_only[:10]:
            report += f"[{err.get('viewport', 'unknown')}] {err.get('text', '')}\n"
    else:
        report += "No console errors recorded.\n"

    report += f"""```

### Network Issues
```
"""

    if failed_requests:
        for req in failed_requests[:10]:
            report += f"[{req.get('viewport', 'unknown')}] {req.get('method', '')} {req.get('url', '')} - {req.get('failure', '')}\n"
    else:
        report += "No failed requests recorded.\n"

    report += f"""```

### Page Errors
```
"""

    if page_errors:
        for err in page_errors[:5]:
            report += f"[{err.get('viewport', 'unknown')}] {err.get('message', '')}\n"
    else:
        report += "No page errors recorded.\n"

    report += """```

---

## Artifacts

### Screenshots
"""

    for shot in screenshots:
        report += (
            f"- `{shot['path']}` - {shot['label']} ({shot['width']}x{shot['height']})\n"
        )

    report += """
### Logs
- `console.log` - Console output
- `errors.log` - Page errors
- `network-failures.log` - Failed requests
- `summary.json` - Capture metadata

---

## Prioritized Recommendations

### Must Fix (Critical)
1. [Recommendation]

### Should Fix (High)
1. [Recommendation]

### Consider Fixing (Medium/Low)
1. [Recommendation]

---

## Observations vs Inferences

### Direct Observations
[List facts directly visible in screenshots or logs]

### Inferences
[List conclusions drawn from observations, marked as inference]

### Needs Verification
[List items that require additional testing or context]

---

## Next Steps

1. Review screenshots at each viewport
2. Fill in findings based on inspection rubric
3. Identify critical issues affecting first-time players
4. Document positive observations
5. Create prioritized recommendation list
"""

    return report


def main():
    args = sys.argv[1:]

    if len(args) == 0:
        print("Usage: summarize-findings.py <summary.json> [output.md]")
        print("")
        print("Arguments:")
        print("  summary.json    Path to summary.json from capture-playwright.mjs")
        print("  output.md       Optional output path (default: inspection-notes.md)")
        print("")
        print("Example:")
        print(
            "  summarize-findings.py artifacts/visual-inspection/2024-01-15/summary.json"
        )
        sys.exit(1)

    summary_path = args[0]
    output_path = args[1] if len(args) > 1 else "inspection-notes.md"

    try:
        summary = load_summary(summary_path)
        report = generate_report(summary, output_path)

        with open(output_path, "w") as f:
            f.write(report)

        print(f"Report generated: {output_path}")
        print("")
        print("Next steps:")
        print("1. Review screenshots in the artifacts directory")
        print("2. Fill in findings based on the inspection rubric")
        print("3. Identify and prioritize issues")

    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in summary file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
