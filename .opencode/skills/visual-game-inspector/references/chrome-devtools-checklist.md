# Chrome DevTools Inspection Checklist

Steps for using browser DevTools to inspect games.

## Pre-Inspection Setup

### Device Emulation
1. Open DevTools (F12 or Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M)
3. Select device or enter custom dimensions
4. Enable device pixel ratio if needed
5. Throttle network if testing slow connections

### Recommended Viewports to Test
| Device | Width | Height | DPR |
|--------|-------|--------|-----|
| iPhone SE | 375 | 667 | 2 |
| iPhone 14 | 390 | 844 | 3 |
| Pixel 5 | 393 | 851 | 2.75 |
| Galaxy S20 | 360 | 800 | 3 |
| iPad Mini | 768 | 1024 | 2 |
| Desktop | 1440 | 900 | 1 |

## Console Inspection

### Error Check
```
Filter: error
```
- [ ] No red errors in console
- [ ] No "Uncaught" exceptions
- [ ] No "TypeError" messages
- [ ] No "ReferenceError" messages
- [ ] No "SyntaxError" messages

### Warning Check
```
Filter: warn
```
- [ ] No deprecation warnings
- [ ] No "deprecated" messages
- [ ] No "will be removed" warnings
- [ ] No browser-specific warnings

### Log Analysis
- [ ] No sensitive data logged
- [ ] No excessive logging
- [ ] No unhandled promise rejections
- [ ] No memory leak warnings

## Network Inspection

### Request Status
- [ ] All requests return 200-299
- [ ] No 404 (not found) errors
- [ ] No 500 (server) errors
- [ ] No CORS errors
- [ ] No blocked resources

### Performance
- [ ] Critical resources load first
- [ ] No oversized assets (>1MB images)
- [ ] No render-blocking scripts
- [ ] Fonts loaded efficiently
- [ ] API responses are fast (<500ms)

### Cache Analysis
- [ ] Static assets cached
- [ ] Cache headers present
- [ ] No unnecessary re-fetches
- [ ] Service worker registered (if PWA)

## Performance Inspection

### Lighthouse Audit
1. Open Lighthouse tab
2. Select "Performance" category
3. Run audit for mobile
4. Review opportunities

### Key Metrics
| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | <2.5s | 2.5-4s | >4s |
| FID | <100ms | 100-300ms | >300ms |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| TTI | <3.8s | 3.8-7.3s | >7.3s |
| TBT | <200ms | 200-600ms | >600ms |

### Runtime Performance
1. Open Performance tab
2. Click Record
3. Interact with game for 10s
4. Stop recording
5. Analyze frames

- [ ] Consistent 60fps
- [ ] No long tasks (>50ms)
- [ ] No layout thrashing
- [ ] No forced reflows
- [ ] Animation on compositor

## Memory Inspection

### Heap Snapshot
1. Open Memory tab
2. Take heap snapshot
3. Look for detached DOM nodes
4. Compare snapshots over time

- [ ] No memory growth over time
- [ ] No detached DOM trees
- [ ] Event listeners cleaned up
- [ ] No closure leaks

### Allocation Timeline
1. Select "Allocation instrumentation on timeline"
2. Record while playing
3. Stop and analyze

- [ ] Allocations reasonable
- [ ] Garbage collection working
- [ ] No allocation spikes

## Rendering Inspection

### Rendering Tab
1. Open Rendering tab (in More Tools)
2. Enable FPS meter
3. Enable paint flashing
4. Enable layout shift regions

- [ ] FPS stable at 60
- [ ] Paint areas minimal
- [ ] No excessive repaints
- [ ] No layout shifts

### Layers
1. Open Layers tab
2. Analyze layer composition
3. Check for layer explosion

- [ ] Reasonable layer count
- [ ] Layers not too large
- [ ] No unnecessary layers

## Application Inspection

### Storage
1. Open Application tab
2. Check Storage section

- [ ] LocalStorage used appropriately
- [ ] SessionStorage cleared when done
- [ ] IndexedDB errors checked
- [ ] Cookies secure and HttpOnly

### Service Worker
1. Check Service Workers section
2. Verify registration
3. Check for updates

- [ ] Service worker registered (PWA)
- [ ] Offline handling works
- [ ] Cache storage reasonable
- [ ] Update mechanism works

### Manifest (PWA)
1. Check Manifest section

- [ ] name and short_name present
- [ ] icons defined
- [ ] start_url correct
- [ ] display mode appropriate
- [ ] theme colors set

## Security Inspection

### Security Tab
1. Open Security tab
2. Check certificate validity
3. Review mixed content

- [ ] Valid SSL certificate
- [ ] No mixed content
- [ ] No insecure resources
- [ ] HTTPS enforced

### Content Security
1. Check Console for CSP violations
2. Review CSP headers

- [ ] CSP header present
- [ ] No inline scripts (or nonce/hash)
- [ ] No eval usage
- [ ] External domains whitelisted

## Mobile-Specific Checks

### Touch Events
```javascript
// In Console
monitorEvents(document, 'touchstart');
monitorEvents(document, 'touchend');
```
- [ ] Touch events firing
- [ ] No touch event conflicts
- [ ] Passive event listeners where possible

### Viewport Meta
```html
<!-- Check in Elements -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```
- [ ] viewport meta tag present
- [ ] width=device-width set
- [ ] initial-scale=1
- [ ] user-scalable appropriate

### Media Queries
1. Open Elements
2. Toggle device toolbar
3. Check styles at different widths

- [ ] Styles apply correctly
- [ ] No layout breaks
- [ ] Responsive images load

## Audit Summary Template

```markdown
## DevTools Audit Results

**URL**: [url]
**Date**: [timestamp]
**Device Emulated**: [device]
**Network**: [Fast 3G / 4G / No throttling]

### Console
- Errors: [count]
- Warnings: [count]
- Notable: [summary]

### Network
- Total Requests: [count]
- Failed Requests: [count]
- Largest Resource: [name, size]
- Slowest Resource: [name, time]

### Performance
- LCP: [value]
- FID: [value]
- CLS: [value]
- TTI: [value]

### Memory
- Heap Size: [value]
- DOM Nodes: [count]
- Event Listeners: [count]

### Issues Found
1. [issue]
2. [issue]
```
