# Spark Animation Handoff Prompt

**Use this prompt with another model to check if it can handle animation production.**

---

## Complete Handoff Prompt

You are being asked to create **32 APNG animation files** for a desktop pet companion called "Spark" in a project called deskbuddy.

### What Exists (Context)

**Project:** deskbuddy (Electron desktop app that shows animated pet characters reacting to coding agent activity)

**Design Files:**
- Figma file: https://www.figma.com/design/AZk0NbB4h9HX25cy70cjq0
- 8 SVG keyframe files already created at: `C:\dev\deskbuddy\themes\spark\assets\`
  - idle-curious.svg
  - happy-excited.svg
  - thinking-confused.svg
  - tired-bored.svg
  - dizzy-overwhelmed.svg
  - playful-mischievous.svg
  - sleeping.svg
  - concerned-error.svg

**Configuration:**
- theme.json fully configured with state mappings, timings, and animation references
- All specifications in README.md, ANIMATION_GUIDE.md, and SPRINT_PLAN.md

### What You Need to Create

#### Core State Animations (13 files) — HIGH PRIORITY
| File | Source SVG | Frames | Duration | Description |
|------|-----------|--------|----------|-------------|
| thinking-confused.apng | thinking-confused.svg | 6 | 3-5s | Head tilts left/center/right, pupils change position, blink cycle |
| working-watch.apng | idle + happy combined | 4-6 | 2-3s | Eyes follow invisible work action, lean in/out motion |
| working-nod.apng | happy + thinking combined | 4-6 | 2-3s | Head nods up/down rhythmically, maintains focused expression |
| working-impressed.apng | happy-excited.svg | 8 | 2-3s | Eyes widen progressively, jaw drops, hands rise in amazement |
| juggling-play.apng | playful + happy combined | 8 | 3-4s | Body bounces, arms move (clapping motion), playful smile |
| juggling-dizzy.apng | dizzy-overwhelmed.svg | 8 | 3s | Spinning rotation, eyes spiral/cross, body staggers, arms flail |
| notification-alert.apng | happy-excited.svg | 4-6 | 2-3s | Eyes widen in alert, posture tightens, pointing gesture |
| waking-stretch.apng | sleeping → tired → idle | 5 | 1.5s | Yawn (mouth opens wide), stretch (arms up), transition to alert |
| sweeping-tidy.apng | idle + playful combined | 6 | 2-4s | Dusting motion (arm sweeps), organizing gestures, tidying posture |
| carrying-proud.apng | happy + playful combined | 6 | 3-5s | Chest puffed out, carrying invisible object, proud stance, smile |
| happy-excited.apng | happy-excited.svg | 8 | 4-6s | Jump/bounce cycle, arms raised, big smile, celebration motion |
| concerned-error.apng | concerned-error.svg | 4-6 | 2-4s | Worried eyes (widened), tears fall, mouth frown, hand on chest |
| sleeping.apng | sleeping.svg | 6 | Infinite loop | Peaceful sleep with breathing (subtle body rise/fall), soft snores (ZZZ symbols fade in/out) |

#### Reaction Animations (6 files) — MEDIUM PRIORITY
| File | Frames | Duration | Description |
|------|--------|----------|-------------|
| react-left-cheeky.apng | 6 | 2.5s | Double-click response: grins cheeky, waves at user |
| react-right-cheeky.apng | 6 | 2.5s | Double-click response: laughs, spins/turns away playfully |
| react-flail.apng | 10 | 3s | 4-click response: panics, flails arms, dizzy expression, "caught!" moment |
| react-drag-playful.apng | 6-8 | Variable | Drag response: enjoys motion, bounces along, giggles (body follows drag) |
| react-drag-left.apng | 6 | Variable | Drag-left response: resists playfully, surprised face, then goes along |
| react-drag-right.apng | 6 | Variable | Drag-right response: goes eagerly, excited expression, bounces toward destination |

#### Sleep Sequence (3 files) — MEDIUM PRIORITY
| File | Frames | Duration | Description |
|------|--------|----------|-------------|
| yawning.apng | 6 | 3s | Start sleep: big yawn (mouth opens wide), rubs eyes, stretches |
| dozing.apng | 6 | Infinite loop | Middle sleep: eyes flutter (half-open/closed cycle), soft snores, head nods |
| collapsing.apng | 4 | 0.8s | Collapse into sleep: body tilts/falls into peaceful heap, peaceful expression |

#### Mini Mode Animations (8 files) — LOWER PRIORITY
| File | Description |
|------|-------------|
| mini-idle-peek.apng | Peeking from screen corner, playful lean |
| mini-look.apng | Glancing around from edge (eyes move, head slight turns) |
| mini-alert-excited.apng | Jumps up excitedly from edge, eyes wide with "Hey!" expression |
| mini-celebrate.apng | Happy dance at screen edge, rhythmic bouncing |
| mini-enter-bounce.apng | Bounces onto screen with energy, playful entrance |
| mini-peek.apng | Subtle peek from corner, shy but curious |
| mini-crabwalk.apng | Scuttles sideways across screen edge (crab-walk motion) |
| mini-sleep-cozy.apng | Curled up asleep in corner, peaceful |

### Technical Specifications

**Format:** APNG (Animated PNG)
**ViewBox:** All animations fit within 45×45 SVG units (scale up as needed for frames)
**Frame Rate:** 10 fps typical (100ms per frame), adjust as needed for smoothness
**Colors:**
- Primary Blue: #4A90E2 (RGB: 74, 144, 226)
- Secondary Blue: #6BA3F5 (RGB: 107, 163, 245)
- Dark Blue: #2E5C8A (RGB: 46, 92, 138)
- Accent Orange: #FF9933 (RGB: 255, 153, 51)
- Warm Orange: #FFB347 (RGB: 255, 179, 71)
- Error Red: #FF6B6B (RGB: 255, 107, 107)
- Blush Pink: #FF9999 (RGB: 255, 153, 153)

**File Size Target:** <500KB per animation (compress while maintaining quality)
**Total Theme Size:** <20MB including all assets

**Loop Behavior:**
- Most animations should loop smoothly (end frame transitions back to start frame without jump)
- Some animations play once and return (reactions, waking)
- Sleeping animation loops infinitely

### Process

1. **Use the SVG files as keyframe references** — The 8 SVG files show the base poses/expressions for each emotional state. Use these as visual references for what each animation should convey.

2. **Generate frame sequences** — For each animation:
   - Create intermediate frames between keyframes (e.g., for head tilt: -15° → 0° → +15°)
   - Vary eye position (pupils follow paths or spin for dizzy)
   - Adjust mouth shapes (open/closed/smile/frown)
   - Rotate/bounce body as needed
   - Add motion blur or anticipation as appropriate

3. **Export as PNG frames** — Save each frame as numbered PNG (frame-01.png, frame-02.png, etc.)

4. **Compile to APNG** — Convert PNG sequence to APNG format using:
   - ffmpeg (command-line)
   - ezgif.com (online)
   - ImageMagick
   - Or any APNG-compatible tool

5. **Verify and deploy** — Ensure:
   - Animation loops smoothly (no jump at frame boundary)
   - Colors match specifications
   - Timing feels natural and responsive
   - File sizes are reasonable
   - Deploy to: `C:\dev\deskbuddy\themes\spark\assets\`

### Example: How to Create "thinking-confused.apng"

**Source:** thinking-confused.svg (shows head tilted left with confused eyes and question mark)

**Frames needed (6 total):**
1. Head tilted -15° left, focused confused eyes, question mark visible
2. Head at -7.5°, pupils adjust, question mark slightly faded
3. Head center (0°), eyes blink, question mark gone
4. Head tilted +7.5° right, pupils reset, question mark appears
5. Head at +15° right, confused expression maintained
6. Head returns to -15° (loops back to frame 1)

**Timing:** Each frame holds for ~500ms (total ~3s), can adjust for feel

**Colors:** Use #4A90E2 for body, #6BA3F5 for accent, #2E5C8A for features, #FF9933 for question mark

### Deliverable

**Output:** 32 APNG files placed in `C:\dev\deskbuddy\themes\spark\assets\`

**Each file must:**
- Be named exactly as specified (filenames matter, they're referenced in theme.json)
- Be in APNG format (not GIF, PNG, etc.)
- Loop smoothly without jumps
- Match the color palette
- Meet the timing specifications
- Have file size < 500KB

### Questions to Answer Before Starting

1. **Can you generate/manipulate raster images?** (PNG, GIF, APNG)
2. **Can you access or control ffmpeg or similar image tools?**
3. **Can you create frame sequences and compile them to APNG format?**
4. **Can you ensure smooth animation looping and proper frame timing?**
5. **Can you work with the SVG files as references and extend the emotion/motion?**

### Success Criteria

- [ ] All 32 APNG files created
- [ ] Filenames match specifications exactly
- [ ] Animations loop smoothly (tested visually)
- [ ] Colors consistent with palette
- [ ] Frame timing matches specifications
- [ ] File sizes < 500KB each
- [ ] Total theme < 20MB
- [ ] Ready for integration with deskbuddy app

---

## Context Documents (Reference)

If you need details, these files exist in the project:

- `themes/spark/README.md` — Complete Spark overview and specs
- `themes/spark/ANIMATION_GUIDE.md` — Detailed frame creation instructions
- `themes/spark/SPRINT_PLAN.md` — Sprint breakdown with test cases
- `themes/spark/theme.json` — Full configuration with state mappings
- Figma: https://www.figma.com/design/AZk0NbB4h9HX25cy70cjq0

---

## How to Test This Prompt

Ask the model:

1. **"Can you create APNG animation files?"** ← Check if they have image generation/manipulation capability
2. **"Can you generate PNG frames from SVG references?"** ← Check if they can extend visual designs
3. **"Can you compile PNG sequences into APNG format?"** ← Check if they have tool access
4. **"Can you start with the first 3 animations (thinking-confused, working-watch, working-nod)?"** ← Check if they can execute

If they answer affirmatively to all, you have a candidate. If they hit limitations, you'll know what they can't do.

---

## If They Can't Handle It

Common limitations:
- Can't generate raster images (only SVG/text)
- Can't access ffmpeg or image tools
- Can't manipulate existing images
- Can only write code that *would* do it, not execute it

In those cases, alternatives:
- Use Aseprite (paid, GUI, full control)
- Use ezgif.com (free, drag-and-drop PNG frames)
- Write a Python script (PIL/Pillow) that you run locally
- Hire a freelance animator on Fiverr/Upwork

---

**End of Handoff Prompt**
