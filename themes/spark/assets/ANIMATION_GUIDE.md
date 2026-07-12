# Spark Animation Implementation Guide

## Overview
Spark uses a combination of **static SVGs** (for eye-tracking in idle) and **APNG animations** (for expressive state changes and reactions).

## Files Created

### 1. Core Emotional State SVGs (Eye-Tracking Ready)
- ✅ `idle-curious.svg` — Base idle state with `#eyes-js`, `#body-js`, `#shadow-js` for cursor tracking
- ✅ `happy-excited.svg` — Celebrating, arms up, big smile
- ✅ `thinking-confused.svg` — Head tilt, confused eyes, question mark
- ✅ `tired-bored.svg` — Half-closed eyes, slouched, yawning mouth
- ✅ `dizzy-overwhelmed.svg` — Spinning rotation, spiral eyes, flailing arms
- ✅ `playful-mischievous.svg` — Cheeky grin, winking, one raised eyebrow
- ✅ `sleeping.svg` — Peaceful closed eyes, smile, tucked arms, ZZZs
- ✅ `concerned-error.svg` — Worried eyes, tear drops, sad mouth, error symbol

### 2. APNG Animations to Create

These SVGs need to be converted to **multi-frame APNG animations**. Each requires 6-12 frames for smooth animation loops.

#### Core State Animations
| File | Source Frames | Loop Duration | Purpose |
|------|---|---|---|
| `thinking-confused.apng` | thinking-confused.svg | 3-5s | Loop: tilting head, blinking, questioning |
| `working-watch.apng` | idle + happy | 2-3s | Loop: eyes following invisible action, leaning in |
| `working-nod.apng` | happy-excited + thinking | 2-3s | Loop: nodding head, bouncing rhythm |
| `working-impressed.apng` | happy-excited (8 frames) | 2-3s | Loop: eyes widening, jaw dropping, amazement |
| `juggling-play.apng` | playful + happy | 3-4s | Loop: bouncing, clapping, playful movement |
| `juggling-dizzy.apng` | dizzy-overwhelmed (8 frames) | 3s | Loop: spinning faster, getting dizzier |
| `notification-alert.apng` | happy-excited | 2-3s | Loop: eyes wide, alert, pointing |
| `waking-stretch.apng` | sleeping → tired → idle | 1.5s | Play once: yawn, stretch, wake up |

#### Reaction Animations (Triggered by clicks/drags)
| File | Duration | Trigger | Purpose |
|---|---|---|---|
| `react-left-cheeky.apng` | 2.5s | Double-click left | Grins, waves cheeky at user |
| `react-right-cheeky.apng` | 2.5s | Double-click right | Laughs, spins away from user |
| `react-flail.apng` | 3s | 4 rapid clicks | Flails arms, dizzy panic, caught expression |
| `react-drag-playful.apng` | Variable | Drag (any) | Enjoys being dragged, giggles, bounces |
| `react-drag-left.apng` | Variable | Drag left | Resists playfully, surprised face |
| `react-drag-right.apng` | Variable | Drag right | Goes eagerly, excited, bounces toward destination |

#### Mini Mode Animations (Screen-edge peeking)
| File | Purpose |
|---|---|
| `mini-idle-peek.apng` | Peeking from corner, playful |
| `mini-look.apng` | Glancing around from edge |
| `mini-alert-excited.apng` | Jumps up excitedly, "Hey!" |
| `mini-celebrate.apng` | Happy dance at edge |
| `mini-enter-bounce.apng` | Bounces onto screen with energy |
| `mini-peek.apng` | Subtle peek, curious |
| `mini-crabwalk.apng` | Scuttles across screen edge |
| `mini-sleep-cozy.apng` | Curled up asleep in corner |

#### Sleep Sequence Animations
| File | Duration | Sequence |
|---|---|---|
| `yawning.apng` | 3s | Big yawn, rubs eyes, stretches |
| `dozing.apng` | Loop | Eyes flutter, soft snores, head nods |
| `collapsing.apng` | 0.8s | Collapses into peaceful heap |

## How to Create APNGs

### Option 1: Programmatic (Recommended)
Use **ffmpeg** to convert frame sequences to APNG:

```bash
# Create numbered frames from SVG using Inkscape or similar
# Then convert to APNG
ffmpeg -framerate 10 -pattern_type glob -i "frames/*.png" \
  -c:v libopng -pred mixed output.apng
```

### Option 2: Online Tools
1. https://ezgif.com/apng-maker — Upload PNG frames, adjust timing, download APNG
2. Ensure frame duration is set (typically 100ms = 10fps for smooth animation)

### Option 3: Manual (Aseprite, GIMP, etc.)
1. Export each emotional state SVG as PNG (multiple variations for animation frames)
2. Create animation frames by:
   - Blinking eyes (2 frames)
   - Rotating/tilting head (3-4 frames)
   - Mouth position changes (2-3 frames)
3. Layer and export as APNG

## Frame Creation Strategy

Each animation should have:
- **2-4 frames** for simple loops (breathing, blinking)
- **6-8 frames** for expressive animations (head tilt, mouth changes)
- **10-12 frames** for complex reactions (spinning, flailing)

**Key variations per frame:**
- Eye position/pupil placement (follow cursor path or rotate)
- Mouth shape (open, closed, smile, frown)
- Head rotation (tilt, turn, nod)
- Body position (bounce, lean, slouch)
- Arm position (up, down, out, flailing)

## Color Consistency

All APNG frames must use:
- **Primary blue:** `#4A90E2` (RGB: 74, 144, 226)
- **Secondary blue:** `#6BA3F5` (RGB: 107, 163, 245)
- **Dark blue:** `#2E5C8A` (RGB: 46, 92, 138)
- **Accent colors:** Oranges (`#FF9933`, `#FFB347`), Reds (`#FF6B6B`, `#FF9999`) for emotions

## Deployment

1. **Create APNG files** using method above
2. **Place in** `themes/spark/assets/`
3. **Verify** theme.json paths match filenames exactly
4. **Test** each state by triggering corresponding agent event

## Next Steps

1. ✅ SVG emotional states created (can be used as keyframes)
2. ⏳ Convert SVGs → frame sequences (PNG)
3. ⏳ Create multi-frame animations
4. ⏳ Convert frame sequences → APNG
5. ⏳ Deploy to `themes/spark/assets/`
6. ⏳ Integration testing with deskbuddy

---

## Quick Test

To test without full animations:
1. Copy `idle-curious.svg` as `thinking.svg`, `working.svg`, etc.
2. The app will display static frames (eye-tracking won't work on non-idle, but states will show)
3. Once APNGs are ready, swap in the animated versions

