# Spark — Playful Pet Companion Theme

**Version:** 1.0.0 (Animation Assets Pending)  
**Author:** Nikhil Hilster  
**Status:** Design Complete, Ready for Animation

---

## Overview

Spark is a **playful, mischievous pet companion** designed to emotionally mirror and amplify the robot mascot's coding activity. Unlike the professional, focused robot, Spark expresses personality through expressive animations and interactive reactions.

**Design Philosophy:**
- Playful & Empathetic: Reacts with humor and emotional connection
- Expressive: Large eyes, mouth, and body language for clear emotion reading
- Interactive: Encourages user engagement through click/drag reactions
- Geometric & Blue: Matches the robot mascot's aesthetic but with warmer, friendlier personality

---

## Current State

### ✅ Completed
- [x] **theme.json** — Full configuration with state mappings, eye-tracking, mini mode
- [x] **8 Emotional SVGs** — Core character designs with eye-tracking elements
  - idle-curious.svg (with #eyes-js, #body-js, #shadow-js for cursor tracking)
  - happy-excited.svg
  - thinking-confused.svg
  - tired-bored.svg
  - dizzy-overwhelmed.svg
  - playful-mischievous.svg
  - sleeping.svg
  - concerned-error.svg
- [x] **State Mapping** — Documented how Spark responds to all 13 agent states
- [x] **Animation Guide** — Instructions for creating APNG animations from SVGs

### ⏳ Pending
- [ ] APNG animations (multi-frame)
- [ ] Reaction animations (click/drag responses)
- [ ] Mini mode animations (screen-edge peeking)
- [ ] Sleep sequence animations (yawn → doze → collapse)
- [ ] Audio files (optional: spark-complete.mp3, spark-confirm.mp3)

---

## State Mapping

Spark responds to **13 core agent states**:

| Agent State | Spark's Emotion | Animation File |
|---|---|---|
| **idle** | Curious | idle-curious.svg (static) |
| **thinking** | Confused | thinking-confused.apng (tilting head) |
| **working (1 session)** | Interested | working-watch.apng (watching intently) |
| **working (2 sessions)** | Focused | working-nod.apng (nodding along) |
| **working (3+ sessions)** | Amazed | working-impressed.apng (awe, hands up) |
| **juggling (1 subagent)** | Playful | juggling-play.apng (bouncing, clapping) |
| **juggling (2+ subagents)** | Overwhelmed | juggling-dizzy.apng (spinning, dizzy) |
| **error** | Concerned | concerned-error.apng (worried, tears) |
| **attention** | Happy | happy-excited.apng (celebrating, jumping) |
| **notification** | Alert | notification-alert.apng (eyes wide, pointing) |
| **sweeping** | Tidying | sweeping-tidy.apng (dusting, organizing) |
| **carrying** | Proud | carrying-proud.apng (showing off) |
| **sleeping** | Peaceful | sleeping.apng (snoring, ZZZs) |

---

## Eye-Tracking System

**idle-curious.svg** includes SVG elements for real-time eye tracking:

```svg
<!-- Eyes follow cursor movement -->
<g id="eyes-js">
  <circle id="left-eye" cx="5" cy="3" r="1.8" fill="white"/>
  <circle id="right-eye" cx="10" cy="3" r="1.8" fill="white"/>
</g>

<!-- Subtle body rotation with cursor -->
<g id="body-js">
  <!-- Main body with transforms applied -->
</g>

<!-- Shadow perspective shift -->
<ellipse id="shadow-js" cx="7.5" cy="15" rx="6" ry="2"/>
```

The app will automatically:
- Poll mouse position every 50ms
- Calculate eye offset based on distance
- Apply CSS transforms to follow cursor
- Update shadow stretch/shift for perspective

---

## Click Reactions

Spark has playful responses to user interaction:

| Interaction | Reaction | Duration |
|---|---|---|
| Double-click (left) | Grins, waves cheeky | 2.5s |
| Double-click (right) | Laughs, spins away | 2.5s |
| 4 rapid clicks | Flails, dizzy panic | 3s |
| Drag (any direction) | Enjoys being moved, bounces | Variable |
| Drag (left) | Resists playfully, surprised | Variable |
| Drag (right) | Goes eagerly, excited | Variable |

---

## Sleep Sequence

When the mouse is idle for 60+ seconds, Spark progresses through a **sleep journey**:

1. **20s idle** → `idle-daydream.apng` (3s) — Eyes dreamy, imagines something
2. **60s total** → `yawning.apng` (3s) — Big yawn, stretches, rubs eyes
3. **~70s** → `dozing.apng` (loop) — Eyes flutter, soft snores, head nods
4. **10+ min** → `collapsing.apng` (0.8s) — Collapses peacefully
5. **10+ min deep** → `sleeping.apng` (loop) — Peaceful sleep with breathing
6. **Mouse moves** → `waking-stretch.apng` (1.5s) — Wakes up, stretches → back to idle

---

## Mini Mode

When the window is minimized or moved to screen edge, Spark **peeks playfully**:

| Mini State | Animation | Behavior |
|---|---|---|
| idle | mini-idle-peek.apng | Peeking playfully |
| alert | mini-alert-excited.apng | Eyes widen, jumps excitedly |
| happy | mini-celebrate.apng | Happy dance at edge |
| enter | mini-enter-bounce.apng | Bounces onto screen |
| sleep | mini-sleep-cozy.apng | Curled up asleep |
| crabwalk | mini-crabwalk.apng | Scuttles across edge |

---

## How to Create Animations

See **ANIMATION_GUIDE.md** for detailed instructions.

**Quick Summary:**
1. Use the 8 SVG files as keyframes (examples of each emotional expression)
2. Create 6-12 frame sequences by adjusting:
   - Eye position/pupils (follow path or spin)
   - Mouth shape (open, closed, smile, frown)
   - Head rotation (tilt, nod, turn)
   - Body bounce/lean
   - Arm position
3. Export as **APNG** (animated PNG)
4. Place in `assets/` directory
5. Verify filenames match `theme.json` exactly

**Tools:**
- **ffmpeg** → Convert frame sequences to APNG
- **ezgif.com** → Online APNG maker
- **Aseprite/GIMP** → Manual frame creation

---

## File Structure

```
themes/spark/
├── theme.json                  # Configuration (complete)
├── README.md                   # This file
├── assets/
│   ├── .gitkeep
│   ├── ANIMATION_GUIDE.md      # Frame creation instructions
│   │
│   ├── idle-curious.svg        # ✅ Eye-tracking SVG (cursor-reactive)
│   ├── happy-excited.svg       # ✅ Celebration pose
│   ├── thinking-confused.svg   # ✅ Head tilt, confused eyes
│   ├── tired-bored.svg         # ✅ Half-closed, yawning
│   ├── dizzy-overwhelmed.svg   # ✅ Spinning, spiral eyes
│   ├── playful-mischievous.svg # ✅ Cheeky grin, winking
│   ├── sleeping.svg            # ✅ Peaceful sleep
│   ├── concerned-error.svg     # ✅ Worried, tears
│   │
│   ├── thinking-confused.apng     # ⏳ Multi-frame loop
│   ├── working-watch.apng         # ⏳ Watching intently
│   ├── working-nod.apng           # ⏳ Nodding along
│   ├── working-impressed.apng     # ⏳ Amazed reaction
│   ├── juggling-play.apng         # ⏳ Playful bouncing
│   ├── juggling-dizzy.apng        # ⏳ Spinning dizzy
│   ├── notification-alert.apng    # ⏳ Alert expression
│   ├── waking-stretch.apng        # ⏳ Yawn & wake
│   │
│   ├── react-left-cheeky.apng      # ⏳ Click-left reaction
│   ├── react-right-cheeky.apng     # ⏳ Click-right reaction
│   ├── react-flail.apng            # ⏳ Multi-click reaction
│   ├── react-drag-playful.apng     # ⏳ Drag reaction
│   ├── react-drag-left.apng        # ⏳ Drag-left reaction
│   ├── react-drag-right.apng       # ⏳ Drag-right reaction
│   │
│   ├── yawning.apng                # ⏳ Sleep sequence (start)
│   ├── dozing.apng                 # ⏳ Sleep sequence (middle)
│   ├── collapsing.apng             # ⏳ Sleep sequence (collapse)
│   │
│   ├── mini-idle-peek.apng         # ⏳ Mini mode (idle)
│   ├── mini-alert-excited.apng     # ⏳ Mini mode (alert)
│   ├── mini-celebrate.apng         # ⏳ Mini mode (happy)
│   ├── mini-enter-bounce.apng      # ⏳ Mini mode (entering)
│   ├── mini-sleep-cozy.apng        # ⏳ Mini mode (sleeping)
│   ├── mini-crabwalk.apng          # ⏳ Mini mode (walking)
│   │
│   ├── sounds/
│   │   ├── spark-complete.mp3      # ⏳ Task completion sound
│   │   └── spark-confirm.mp3       # ⏳ Confirmation sound
```

---

## Design Specs

| Property | Value |
|---|---|
| **ViewBox** | -15, -25, 45×45 (45×45 SVG units) |
| **Primary Blue** | #4A90E2 (RGB: 74, 144, 226) |
| **Secondary Blue** | #6BA3F5 (RGB: 107, 163, 245) |
| **Dark Blue** | #2E5C8A (RGB: 46, 92, 138) |
| **Accent Colors** | Oranges (#FF9933, #FFB347), Reds (#FF6B6B, #FF9999) |
| **Eye Tracking** | Enabled on idle state only |
| **Eye Max Offset** | 3 SVG units |
| **Content Box** | 23×20 units, centered |
| **Animation Format** | APNG (preferred), GIF, WebP, PNG, JPG |

---

## Integration Checklist

- [x] theme.json created and configured
- [x] 8 emotional SVG keyframes designed
- [x] Eye-tracking elements added to idle state
- [x] State mapping documented
- [x] Animation guide provided
- [ ] APNG animations created (from SVGs)
- [ ] Animation files deployed to assets/
- [ ] theme.json paths verified
- [ ] Eye-tracking tested (idle state)
- [ ] Click reactions tested
- [ ] Sleep sequence tested
- [ ] Mini mode tested
- [ ] All states visually verified

---

## Next Steps

1. **Create APNG animations** using the SVG files as keyframe references
2. **Deploy** animation files to `assets/` directory
3. **Test** by launching deskbuddy with Spark theme selected
4. **Verify** each state displays correctly
5. **Refine** animations based on visual feedback

---

## Quick Start (Temporary Testing)

Until full animations are ready, the SVG files alone can be used:

```bash
# Copy SVGs as placeholders for missing animations
cp assets/idle-curious.svg assets/thinking-confused.apng
cp assets/happy-excited.svg assets/happy-excited.apng
# ... etc

# Test theme loads in deskbuddy
```

This allows testing the state machine and UI without waiting for animation conversion.

---

## Figma Design File

**Master Design:** https://www.figma.com/design/AZk0NbB4h9HX25cy70cjq0

All 8 emotional states are in Figma and can be used as reference for animation frame creation.

---

## Color Palette Reference

```
Primary Blue:     #4A90E2 (RGB: 74, 144, 226)
Secondary Blue:   #6BA3F5 (RGB: 107, 163, 245)
Dark Blue:        #2E5C8A (RGB: 46, 92, 138)
Accent Orange:    #FF9933 (RGB: 255, 153, 51)
Warm Orange:      #FFB347 (RGB: 255, 179, 71)
Error Red:        #FF6B6B (RGB: 255, 107, 107)
Blush Pink:       #FF9999 (RGB: 255, 153, 153)
Shadow:           rgba(0, 0, 0, 0.15)
```

---

## Personality Summary

Spark is the **emotional heart** of "The Gang" — a multi-character desktop companion system. While the robot handles the technical work, Spark provides:

- **Empathy** — Reacts to success/failure with genuine emotion
- **Humor** — Playful, mischievous personality
- **Engagement** — Interactive reactions to clicks/drags
- **Personality** — Expression through varied animations
- **Comfort** — Peaceful sleep sequence, comforting presence

Together, robot + Spark = **complete emotional ecosystem** for developers.

