# Mobile Game UX Checklist

Mobile-first verification for game UX.

## Touch Interaction

### Touch Targets
- [ ] All interactive elements are at least 44x44px
- [ ] Touch targets have at least 8px spacing between them
- [ ] Primary actions are in thumb-reach zone (bottom 2/3 of screen)
- [ ] Destructive actions are away from primary targets
- [ ] Touch targets are visually indicated (not invisible)

### Gestures
- [ ] Swipe gestures are intuitive (swipe direction matches expectation)
- [ ] Pinch-to-zoom works if zooming is needed
- [ ] Long-press is discoverable or taught
- [ ] Multi-touch works correctly (pinch, two-finger)
- [ ] Gesture conflicts are avoided (scroll vs swipe)

### Feedback
- [ ] Every touch has visual feedback
- [ ] Touch feedback is immediate (<100ms)
- [ ] Feedback is visible (color change, scale, ripple)
- [ ] Haptic feedback used where appropriate
- [ ] Invalid touches are indicated (disabled state shows)

## Screen Layout

### Viewport
- [ ] No horizontal overflow on any viewport
- [ ] Content scales properly across 320px to 428px widths
- [ ] Safe areas are respected (notch, home indicator)
- [ ] Status bar area is handled correctly
- [ ] Full-screen mode works properly

### Orientation
- [ ] Game works in portrait orientation
- [ ] Game works in landscape orientation (or locks appropriately)
- [ ] Orientation change preserves game state
- [ ] Layout adapts smoothly to rotation
- [ ] Controls reposition logically on rotate

### Information Display
- [ ] Critical info visible without scrolling
- [ ] Score/stats visible during gameplay
- [ ] Time remaining is visible if time-based
- [ ] Lives/attempts visible if applicable
- [ ] Currency/resources visible

## Input Handling

### Keyboard
- [ ] Virtual keyboard doesn't cover inputs
- [ ] Keyboard type matches input (numeric for numbers)
- [ ] Enter key behavior is appropriate
- [ ] Auto-focus doesn't cause unwanted scroll
- [ ] Keyboard dismiss is easy (tap outside, close button)

### Form Inputs
- [ ] Input fields are clearly labeled
- [ ] Validation errors are shown inline
- [ ] Error messages are helpful
- [ ] Auto-complete works where expected
- [ ] Password fields have show/hide toggle

### Game Controls
- [ ] On-screen controls don't obscure gameplay
- [ ] Control positions are comfortable
- [ ] Controls are sized for thumbs
- [ ] Control opacity allows seeing through them
- [ ] Controls can be repositioned if needed

## Performance Perception

### Load Time
- [ ] Initial load shows progress
- [ ] Interactive within 3 seconds on 3G
- [ ] Subsequent loads are faster
- [ ] Loading screen is engaging (tips, animation)
- [ ] Background loading is indicated

### Responsiveness
- [ ] Touch response feels instant
- [ ] Animations run at 60fps
- [ ] No frozen frames during interaction
- [ ] Background operations don't block UI
- [ ] Scrolling is smooth

### Battery/Data
- [ ] Doesn't drain battery excessively
- [ ] Works offline or indicates requirement
- [ ] Data usage is reasonable
- [ ] Background activity is minimized
- [ ] Low-power mode is handled

## First-Time Experience

### Onboarding
- [ ] Tutorial is skippable
- [ ] Tutorial teaches one thing at a time
- [ ] Practice mode available
- [ ] Contextual tips appear when needed
- [ ] Returning players skip onboarding

### Discovery
- [ ] Core gameplay is obvious within 5 seconds
- [ ] Controls are self-explanatory or taught
- [ ] Goal is clear without explanation
- [ ] First success happens quickly
- [ ] Early rewards encourage continuation

### Accessibility
- [ ] Text is readable (size and contrast)
- [ ] Color is not the only indicator
- [ ] Audio cues have visual alternatives
- [ ] Reduced motion is respected
- [ ] Screen reader works (if web-based)

## Error Handling

### Connectivity
- [ ] Offline state is clearly indicated
- [ ] Retry is available for failed requests
- [ ] Progress is saved locally
- [ ] Reconnection is automatic
- [ ] No data loss on disconnect

### Errors
- [ ] Error messages are in plain language
- [ ] Errors suggest resolution
- [ ] Errors don't interrupt gameplay unnecessarily
- [ ] Recovery is possible without restart
- [ ] Support/help is accessible

### Crashes
- [ ] Game state is preserved on crash
- [ ] Crash doesn't require reinstall
- [ ] Crash reporting is transparent
- [ ] Graceful degradation for older devices
- [ ] Memory warnings are handled

## Monetization UX

### Ads
- [ ] Ads are skippable or short
- [ ] Ad timing doesn't interrupt gameplay
- [ ] Rewarded ads give clear reward
- [ ] Ad close button is visible
- [ ] No accidental ad clicks

### In-App Purchases
- [ ] Purchase is clearly indicated
- [ ] Price is shown before purchase
- [ ] Confirmation before charge
- [ ] Receipt/confirmation after purchase
- [ ] Refund policy is accessible

### Value
- [ ] Free content is substantial
- [ ] Pay walls are clear
- [ ] Value proposition is obvious
- [ ] Premium feels worth it
- [ ] No deceptive patterns

## Social Features

### Sharing
- [ ] Share doesn't require login
- [ ] Share preview is accurate
- [ ] Share image is game-branded
- [ ] Share text is pre-filled
- [ ] Deep links work

### Multiplayer
- [ ] Matchmaking is fast or has progress
- [ ] Connection quality is indicated
- [ ] Disconnected players are handled
- [ ] Chat is moderated or can be disabled
- [ ] Friend invites are easy
