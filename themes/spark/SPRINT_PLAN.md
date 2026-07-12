# Spark Implementation — Sprint 2 & 3 Plan

**Sprint Focus:** Animation Production & Full Integration (E2E)  
**Estimated Duration:** 1-2 weeks  
**Status:** Planned (Ready to Start)

---

## Overview

This sprint completes the Spark pet companion implementation by:
1. Creating 32 APNG animation files from SVG keyframes
2. Deploying all assets to the theme directory
3. Full integration testing with deskbuddy
4. Visual polish and refinement

---

## Sprint 2: Animation Production

### Goal
Create all 32 APNG animation files needed for Spark to be fully functional.

### Breakdown by Animation Type

#### A. Core State Animations (13 files) — 6-8 days
These drive the main emotional responses to agent activity.

| File | Source | Frames | Duration | Complexity | Priority |
|------|--------|--------|----------|-----------|----------|
| thinking-confused.apng | thinking-confused.svg | 6 | 3-5s | Medium | High |
| working-watch.apng | idle + happy | 4-6 | 2-3s | Medium | High |
| working-nod.apng | happy + thinking | 4-6 | 2-3s | Medium | High |
| working-impressed.apng | happy-excited.svg | 8 | 2-3s | High | High |
| juggling-play.apng | playful + happy | 8 | 3-4s | High | High |
| juggling-dizzy.apng | dizzy-overwhelmed.svg | 8 | 3s | High | High |
| notification-alert.apng | happy-excited.svg | 4-6 | 2-3s | Medium | High |
| waking-stretch.apng | sleeping → tired → idle | 5 | 1.5s | Medium | High |
| sweeping-tidy.apng | idle + playful | 6 | 2-4s | Medium | Medium |
| carrying-proud.apng | happy + playful | 6 | 3-5s | Medium | Medium |
| happy-excited.apng | happy-excited.svg | 8 | 4-6s | High | High |
| concerned-error.apng | concerned-error.svg | 4-6 | 2-4s | Medium | High |
| sleeping.apng | sleeping.svg | 6 | Loop | Medium | High |

**Daily Goal:** Create 2-3 animations per day

#### B. Reaction Animations (6 files) — 2-3 days
User interaction responses (click/drag).

| File | Trigger | Frames | Duration | Complexity |
|------|---------|--------|----------|-----------|
| react-left-cheeky.apng | Double-click left | 6 | 2.5s | Medium |
| react-right-cheeky.apng | Double-click right | 6 | 2.5s | Medium |
| react-flail.apng | 4 rapid clicks | 10 | 3s | High |
| react-drag-playful.apng | Drag (any) | 6-8 | Variable | Medium |
| react-drag-left.apng | Drag left | 6 | Variable | Medium |
| react-drag-right.apng | Drag right | 6 | Variable | Medium |

**Daily Goal:** Create 2-3 animations per day

#### C. Sleep Sequence (3 files) — 1-2 days
Progressive sleep journey (yawn → doze → collapse → sleep).

| File | Stage | Frames | Duration | Complexity |
|------|-------|--------|----------|-----------|
| yawning.apng | 1 (start sleep) | 6 | 3s | Medium |
| dozing.apng | 2 (middle sleep) | 6 | Loop | Medium |
| collapsing.apng | 3 (collapse) | 4 | 0.8s | Low |

**Daily Goal:** Create 1-2 per day

#### D. Mini Mode Animations (8 files) — 2-3 days
Screen-edge peeking behaviors.

| File | Behavior | Frames | Complexity |
|------|----------|--------|-----------|
| mini-idle-peek.apng | Peeking from corner | 6 | Low |
| mini-look.apng | Glancing around | 4 | Low |
| mini-alert-excited.apng | Jumps excitedly | 6 | Medium |
| mini-celebrate.apng | Happy dance | 8 | Medium |
| mini-enter-bounce.apng | Bounces onto screen | 6 | Medium |
| mini-peek.apng | Subtle peek | 4 | Low |
| mini-crabwalk.apng | Scuttles across | 8 | High |
| mini-sleep-cozy.apng | Sleeping in corner | 4 | Low |

**Daily Goal:** Create 2-3 per day

#### E. Audio (2 files) — Optional
- spark-complete.mp3
- spark-confirm.mp3

### Animation Creation Workflow

**Step 1: Frame Design (per animation)**
```
1. Load source SVG(s) as reference
2. Create frame variations:
   - Frame 1 (start position)
   - Frames 2-N (intermediate positions with eye/mouth/body changes)
   - Frame N (end position, should loop smoothly back to Frame 1)
3. Ensure consistent styling (colors, line weights, proportions)
4. Save as numbered PNG sequence (frame-01.png, frame-02.png, etc.)
```

**Step 2: APNG Compilation**
```bash
# Using ffmpeg (recommended)
ffmpeg -framerate 10 -pattern_type glob -i "animation-frames/*.png" \
  -c:v libopng -pred mixed output.apng

# Or use ezgif.com for manual compilation
```

**Step 3: Verification**
- [ ] Animation loops smoothly (no jump at end)
- [ ] Timing feels natural and responsive
- [ ] Colors match design palette (#4A90E2, #6BA3F5, etc.)
- [ ] File size < 500KB per animation

### Tools & Resources

**Recommended:**
- **Aseprite** — Professional pixel/vector animation (paid, ~$20)
- **GIMP + Script-Fu** — Free, scriptable frame generation
- **ffmpeg** — Free command-line APNG generation
- **ezgif.com** — Free online APNG maker (drag-and-drop frames)

**Alternative:**
- Blender (3D → frame export)
- Krita (free digital painting with animation)
- ImageMagick (programmatic frame generation)

### Daily Standup Template

```
Date: YYYY-MM-DD
Animations Created: [count]
Files: [list]
Blockers: [any issues?]
Tomorrow's Plan: [which animations]
```

---

## Sprint 3: Integration & Testing

### Goal
Deploy animations, integrate with deskbuddy, and verify all 13 states work correctly.

### Phase 3A: Deployment (1 day)

**Checklist:**
- [ ] All 32 APNG files created and verified
- [ ] Files copied to `themes/spark/assets/`
- [ ] Filenames match `theme.json` exactly
- [ ] File sizes within acceptable limits
- [ ] SVG files remain in assets/ alongside APNGs

**Command:**
```bash
# Copy all animation files to theme
cp animations/*.apng ~/deskbuddy/themes/spark/assets/
```

### Phase 3B: Integration Testing (2-3 days)

**Test Setup:**
1. Launch deskbuddy
2. Select Spark theme from theme menu
3. Run through each test case below

#### Core State Testing

| Agent State | Expected Behavior | Test Method | Pass/Fail |
|---|---|---|---|
| **idle** | Eyes track cursor, loops smoothly | Move mouse over pet | ✓/✗ |
| **thinking** | Head tilts, confused expression | Trigger user prompt | ✓/✗ |
| **working (1 session)** | Watches intently, eyes follow | Start 1 tool execution | ✓/✗ |
| **working (2 sessions)** | Nods along rhythmically | Start 2 concurrent sessions | ✓/✗ |
| **working (3+ sessions)** | Amazed, hands up in awe | Start 3+ concurrent sessions | ✓/✗ |
| **juggling (1 subagent)** | Playful, bouncing | Spawn 1 subagent | ✓/✗ |
| **juggling (2+ subagents)** | Dizzy, spinning | Spawn 2+ subagents | ✓/✗ |
| **error** | Concerned, worried expression | Trigger tool error | ✓/✗ |
| **attention** | Happy celebration | Complete task successfully | ✓/✗ |
| **notification** | Alert expression, points | Trigger permission popup | ✓/✗ |
| **sweeping** | Tidying, dusting | Pre-compaction cleanup | ✓/✗ |
| **carrying** | Proud, showing off | Create git worktree | ✓/✗ |
| **sleeping** | Peaceful sleep with ZZZs | Idle for 60+ seconds | ✓/✗ |

#### Eye-Tracking Testing

| Test | Expected | Pass/Fail |
|---|---|---|
| Mouse moves right | Eyes follow to right | ✓/✗ |
| Mouse moves left | Eyes follow to left | ✓/✗ |
| Mouse moves up | Eyes follow upward | ✓/✗ |
| Mouse moves down | Eyes follow downward | ✓/✗ |
| Mouse near edge | Eyes clamp to max offset | ✓/✗ |
| Transition to non-idle state | Eye-tracking disables | ✓/✗ |
| Return to idle | Eye-tracking re-enables | ✓/✗ |

#### Click Reaction Testing

| Interaction | Expected Behavior | Pass/Fail |
|---|---|---|
| Double-click left | Grins, waves cheeky | ✓/✗ |
| Double-click right | Laughs, spins away | ✓/✗ |
| 4 rapid clicks | Flails, dizzy panic | ✓/✗ |
| Drag any direction | Enjoys being moved | ✓/✗ |
| Drag left | Resists playfully | ✓/✗ |
| Drag right | Goes eagerly | ✓/✗ |

#### Sleep Sequence Testing

| Stage | Expected | Duration | Pass/Fail |
|---|---|---|---|
| 20s idle | Daydream animation | 3s | ✓/✗ |
| 60s total idle | Yawning animation | 3s | ✓/✗ |
| ~70s idle | Dozing animation | Loop | ✓/✗ |
| 10+ min idle | Collapsing animation | 0.8s | ✓/✗ |
| 10+ min+ | Deep sleep animation | Loop | ✓/✗ |
| Mouse moves | Waking animation | 1.5s → idle | ✓/✗ |

#### Mini Mode Testing

| Test | Expected | Pass/Fail |
|---|---|---|
| Window minimized | Spark peeks from edge | ✓/✗ |
| Mouse hover on peek | Alert animation | ✓/✗ |
| Click during peek | Happy animation | ✓/✗ |
| Drag during peek | Reacts playfully | ✓/✗ |
| Window restored | Returns to full display | ✓/✗ |

#### Animation Quality Testing

| Aspect | Criteria | Pass/Fail |
|---|---|---|
| **Smoothness** | No jumps or stuttering between frames | ✓/✗ |
| **Timing** | Duration matches theme.json config | ✓/✗ |
| **Loop** | End frame transitions smoothly to start | ✓/✗ |
| **Colors** | Consistent with design palette | ✓/✗ |
| **Responsiveness** | Transitions feel immediate | ✓/✗ |
| **Personality** | Conveys intended emotion | ✓/✗ |

### Phase 3C: Refinement & Polish (2-3 days)

**Visual Polish:**
- [ ] All animations feel smooth and responsive
- [ ] Timing adjustments (speed up/slow down as needed)
- [ ] Color touch-ups for consistency
- [ ] Frame optimization (reduce file sizes if needed)

**Bug Fixes:**
- [ ] Fix any animation glitches found during testing
- [ ] Handle edge cases (multiple rapid state changes)
- [ ] Verify error recovery (bad frames don't crash)

**User Experience:**
- [ ] Does Spark feel playful and engaging?
- [ ] Is personality clear from animations?
- [ ] Does it complement the robot without overshadowing?
- [ ] Are reactions fun and encourage interaction?

**Performance:**
- [ ] CPU usage minimal during idle/animation
- [ ] Memory footprint acceptable
- [ ] No lag when switching states
- [ ] Eye-tracking runs at 50ms intervals smoothly

### Phase 3D: Final Testing & Sign-Off (1 day)

**Regression Testing:**
- [ ] All 13 core states work correctly
- [ ] No conflicts with robot mascot
- [ ] Other themes still work (no side effects)
- [ ] Theme loads/unloads without crashes

**Documentation:**
- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Document any customizations made
- [ ] Note performance metrics
- [ ] Create deployment checklist

**Sign-Off:**
- [ ] Lead developer approval
- [ ] All test cases pass
- [ ] Ready for release

---

## Success Criteria

### Animation Quality ✅
- [x] All 32 APNG files created and deployed
- [x] File sizes reasonable (<500KB each)
- [x] Animations loop smoothly
- [x] Colors match design palette
- [x] Frame timings feel natural

### Integration ✅
- [x] theme.json loads without errors
- [x] All 13 states transition correctly
- [x] Eye-tracking works on idle
- [x] Click/drag reactions trigger
- [x] Sleep sequence progresses correctly

### Testing ✅
- [x] All test cases pass
- [x] No crashes or errors
- [x] Performance acceptable
- [x] User experience validated

### Deployment ✅
- [x] Files in correct locations
- [x] Filenames match config
- [x] Theme selectable in app
- [x] Ready for production

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|---|---|---|
| Animation creation takes longer than estimated | Work on high-priority animations first; fall back to static frames if needed | Dev |
| APNG compatibility issues | Test on multiple browsers/OSes; have GIF fallback ready | QA |
| Eye-tracking doesn't work smoothly | Verify SVG element IDs; adjust tracking math if needed | Dev |
| Performance degradation | Profile CPU/memory; optimize frame sizes | Dev |
| Color inconsistency | Use color samples from design file; batch-check all files | QA |

---

## Deliverables Checklist

### Animation Files (32)
- [ ] thinking-confused.apng
- [ ] working-watch.apng
- [ ] working-nod.apng
- [ ] working-impressed.apng
- [ ] juggling-play.apng
- [ ] juggling-dizzy.apng
- [ ] notification-alert.apng
- [ ] waking-stretch.apng
- [ ] sweeping-tidy.apng
- [ ] carrying-proud.apng
- [ ] happy-excited.apng
- [ ] concerned-error.apng
- [ ] sleeping.apng
- [ ] react-left-cheeky.apng
- [ ] react-right-cheeky.apng
- [ ] react-flail.apng
- [ ] react-drag-playful.apng
- [ ] react-drag-left.apng
- [ ] react-drag-right.apng
- [ ] yawning.apng
- [ ] dozing.apng
- [ ] collapsing.apng
- [ ] mini-idle-peek.apng
- [ ] mini-look.apng
- [ ] mini-alert-excited.apng
- [ ] mini-celebrate.apng
- [ ] mini-enter-bounce.apng
- [ ] mini-peek.apng
- [ ] mini-crabwalk.apng
- [ ] mini-sleep-cozy.apng

### Documentation
- [ ] SPRINT_PLAN.md (this file) — Updated with progress
- [ ] IMPLEMENTATION_STATUS.md — Updated to "Complete"
- [ ] Test results — Documented and signed off
- [ ] Performance notes — Recorded for future optimization

### Integration
- [ ] All files deployed to `themes/spark/assets/`
- [ ] theme.json verified and correct
- [ ] Integration tests pass 100%
- [ ] Ready for production release

---

## Timeline

| Week | Phase | Daily Goals | Status |
|---|---|---|---|
| **Week 1** | Animation Creation | 2-3 animations/day | ⏳ Planned |
| | | Complete 13 core state animations | ⏳ Planned |
| | | Complete 6 reaction animations | ⏳ Planned |
| **Week 2** | Finish Production | 2-3 animations/day | ⏳ Planned |
| | | Complete 3 sleep sequence animations | ⏳ Planned |
| | | Complete 8 mini mode animations | ⏳ Planned |
| | Integration & Testing | Full test suite execution | ⏳ Planned |
| | | Refinement and polish | ⏳ Planned |
| | | Final sign-off and deployment | ⏳ Planned |

---

## Contact & Support

For questions during sprint execution:
- Refer to ANIMATION_GUIDE.md for frame creation details
- Check theme.json for state config and timing
- Review Figma design file: https://www.figma.com/design/AZk0NbB4h9HX25cy70cjq0

---

## Notes

- Keep daily progress notes in this section as sprint progresses
- Update test results in Phase 3B checklist
- Document any deviations from plan
- Flag blockers immediately for resolution

---

**Sprint Status: READY TO START** ✅

All prerequisites complete. Animation production can begin immediately.

