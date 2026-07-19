# Rave Raccoon

Meet **Riff**, a tiny neon night explorer inspired by the curious, clever
raccoons that roam Toronto after dark. Riff treats coding work like a citywide
side quest and every successful turn like a tiny rave.

## Character direction

- Cute, personified raccoon silhouette with a readable mask and ringed tail
- Teal and ultraviolet windbreaker, cross-body explorer satchel, glow bracelets
- Warm amber eyes and strong brows for clear emotion at desktop-pet scale
- Psychedelic cyan, magenta, lime, and violet aura effects
- Cozy hand-painted game-character shapes with small pixel-art accents
- Limited-animation timing: long readable holds, sudden snaps, squash poses,
  and two-frame anticipation/recovery beats

Riff talks only in short, optional bursts baked into state and idle animations.
The lines are intentionally small and characterful:

- `SIDE QUEST?`
- `PLOT TWIST...`
- `IN THE FLOW`
- `YO?`
- `NICE!`
- `UH-OH`
- `FOUND IT!`
- `ENCORE!`

## State story

| DeskBuddy state | Riff's behavior |
|---|---|
| Idle | Breathes, tracks the cursor, checks a city map, or starts a tiny dance |
| Thinking | Studies a holographic route and considers the next side quest |
| Working | Mixes commands on a pocket sampler |
| 2 sessions | Puts on headphones and locks into the groove |
| 3+ sessions | Opens a psychedelic code portal |
| Subagents | Juggles glow-orbs; conducts a full swarm at 2+ |
| Attention | Leaps into a confetti celebration |
| Notification | Pops up with a bright `YO?` |
| Error | Gets startled, then visibly regroups |
| Sweeping | Vacuums loose context-pixels into the explorer satchel |
| Carrying | Proudly returns with a discovered treasure |
| Sleep | Yawns, nods off, curls around the tail, and wakes with a snap |

## Regenerate the SVG set

The production SVGs are deterministic and dependency-free:

```powershell
node themes/rave-raccoon/assets/_gen/generate-riff-assets.js
node scripts/validate-theme.js themes/rave-raccoon
```

The original visual-development sheet is preserved at
`assets/source/rave-raccoon/riff-concept-sheet.png`.

## Files

- `theme.json` — complete state, reaction, mini-mode, layout, and timing map
- `assets/*.svg` — transparent, animated production assets
- `assets/_gen/generate-riff-assets.js` — source generator for the SVG set

No external fonts, images, scripts, or runtime dependencies are used by the
production theme.
