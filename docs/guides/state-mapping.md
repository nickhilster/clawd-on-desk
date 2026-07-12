# State Mapping

[Back to README](../../README.md)

Most lifecycle events from agents (Claude Code hooks, Codex JSONL, Copilot hooks) map to the same animation states.

Subagent events still map to the logical `juggling` state, but DeskBuddy now chooses a tiered asset by live subagent count: 1 subagent uses `deskbuddy-headphones-groove.svg`, while 2+ subagents use `deskbuddy-working-juggling.svg`. The old DeskBuddy conducting asset is retired; Calico and Cloudling still use their conducting animations for their 2+ subagent tier.

| Agent Event | State | Animation | DeskBuddy | Calico | Cloudling |
|---|---|---|---|---|---|
| Idle (no activity) | idle | Eye-tracking follow | <img src="../../assets/gif/deskbuddy-idle.gif" width="160"> | <img src="../../assets/gif/calico-idle.gif" width="130"> | <img src="../../assets/gif/cloudling-idle.gif" width="140"> |
| Idle (random) | idle | Reading / patrol | <img src="../../assets/gif/deskbuddy-idle-reading.gif" width="160"> | | <img src="../../assets/gif/cloudling-idle-reading.gif" width="140"> |
| UserPromptSubmit | thinking | Thought bubble + spark | <img src="../../assets/gif/deskbuddy-thinking.gif" width="160"> | <img src="../../assets/gif/calico-thinking.gif" width="130"> | <img src="../../assets/gif/cloudling-thinking.gif" width="140"> |
| PreToolUse / PostToolUse (1 session) | working (typing) | Typing | <img src="../../assets/gif/deskbuddy-typing.gif" width="160"> | <img src="../../assets/gif/calico-typing.gif" width="130"> | <img src="../../assets/gif/cloudling-typing.gif" width="140"> |
| PreToolUse / PostToolUse (2 sessions) | working (2-session tier) | Headphones groove | <img src="../../assets/gif/deskbuddy-headphones-groove.gif" width="160"> | <img src="../../assets/gif/calico-juggling.gif" width="130"> | <img src="../../assets/gif/cloudling-juggling.gif" width="140"> |
| PreToolUse (3+ sessions) | working (building) | Building | <img src="../../assets/gif/deskbuddy-building.gif" width="160"> | <img src="../../assets/gif/calico-building.gif" width="130"> | <img src="../../assets/gif/cloudling-building.gif" width="140"> |
| SubagentStart (1) | juggling | Headphones groove | <img src="../../assets/gif/deskbuddy-headphones-groove.gif" width="160"> | <img src="../../assets/gif/calico-juggling.gif" width="130"> | <img src="../../assets/gif/cloudling-juggling.gif" width="140"> |
| SubagentStart (2+) | juggling (2+ tier) | Three-ball juggling | <img src="../../assets/gif/deskbuddy-juggling.gif" width="160"> | <img src="../../assets/gif/calico-conducting.gif" width="130"> | <img src="../../assets/gif/cloudling-conducting.gif" width="140"> |
| PostToolUseFailure | error | Error | <img src="../../assets/gif/deskbuddy-error.gif" width="160"> | <img src="../../assets/gif/calico-error.gif" width="130"> | <img src="../../assets/gif/cloudling-error.gif" width="140"> |
| Stop / PostCompact | attention | Happy | <img src="../../assets/gif/deskbuddy-happy.gif" width="160"> | <img src="../../assets/gif/calico-happy.gif" width="130"> | <img src="../../assets/gif/cloudling-attention.gif" width="140"> |
| PermissionRequest | notification | Alert | <img src="../../assets/gif/deskbuddy-notification.gif" width="160"> | <img src="../../assets/gif/calico-notification.gif" width="130"> | <img src="../../assets/gif/cloudling-notification.gif" width="140"> |
| PreCompact | sweeping | Sweeping | <img src="../../assets/gif/deskbuddy-sweeping.gif" width="160"> | <img src="../../assets/gif/calico-sweeping.gif" width="130"> | <img src="../../assets/gif/cloudling-sweeping.gif" width="140"> |
| WorktreeCreate | carrying | Carrying | <img src="../../assets/gif/deskbuddy-carrying.gif" width="160"> | <img src="../../assets/gif/calico-carrying.gif" width="130"> | <img src="../../assets/gif/cloudling-carrying.gif" width="140"> |
| 60s mouse idle | sleeping | Sleep | <img src="../../assets/gif/deskbuddy-sleeping.gif" width="160"> | <img src="../../assets/gif/calico-sleeping.gif" width="130"> | <img src="../../assets/gif/cloudling-sleeping.gif" width="140"> |
| SessionEnd | remove session; idle if no live sessions | No sleep transition | | | |

## Kimi Code CLI (Kimi-CLI) Hook Events

Kimi Code CLI (Kimi-CLI) now uses hook-only integration (`~/.kimi/config.toml`), and maps these 13 hook events to shared DeskBuddy states:

| Kimi Hook Event | State |
|---|---|
| SessionStart | idle |
| SessionEnd | remove session; idle if no live sessions |
| UserPromptSubmit | thinking |
| PreToolUse | working by default. Permission animation only flips when payload carries explicit approval signals (`permission_required` / `requires_approval` / `waiting_for_approval` / `is_permission_request`). Persistent mode switch: `DESKBUDDY_KIMI_PERMISSION_MODE=explicit` (default — only explicit signals trigger notification) or `DESKBUDDY_KIMI_PERMISSION_MODE=suspect` (deferred heuristic for gated tools). The installer (`npm run install:kimi-hooks` and the auto-sync at startup) bakes this value into the `command` field of `~/.kimi/config.toml` so it survives DeskBuddy restarts. Other optional knobs: `DESKBUDDY_KIMI_PERMISSION_IMMEDIATE=1` forces immediate remap for permission-gated tools; `DESKBUDDY_KIMI_PERMISSION_SUSPECT=1` (legacy alias) enables deferred suspect mode for the current process only; `DESKBUDDY_KIMI_PERMISSION_SUSPECT_MS=<ms>` tunes the suspect window; `DESKBUDDY_KIMI_DISABLE_PRETOOL_PERMISSION=1` keeps explicit-only behavior even when optional modes are set. |
| PostToolUse | working |
| PostToolUseFailure | error |
| Stop | attention |
| StopFailure | error |
| SubagentStart | juggling |
| SubagentStop | working |
| PreCompact | sweeping |
| PostCompact | attention |
| Notification | notification |

## Gemini CLI Hook Notes

Gemini CLI stays on hook-only integration, but two Gemini-native events are intentionally not forced into the shared Claude/Codex semantics:

| Gemini Hook Event | DeskBuddy behavior |
|---|---|
| AfterAgent | Recorded as `AfterAgent` and the session returns to `idle`. It does not remap to shared `Stop`, so Gemini turns no longer auto-show the `attention` / done animation. |
| PreCompress | Recorded as `PreCompress` in session history, but does not switch the pet to `sweeping`. The current visible state (usually `thinking` or `working`) stays in place. |

## Pi Extension Events

Pi uses a global extension (`~/.pi/agent/extensions/deskbuddy`) and maps interactive-session lifecycle events to shared DeskBuddy states:

| Pi Extension Event | DeskBuddy Event | State |
|---|---|---|
| session_start | SessionStart | idle |
| before_agent_start | UserPromptSubmit | thinking |
| tool_call | PreToolUse | working |
| tool_result (ok) | PostToolUse | working |
| tool_result (isError) | PostToolUseFailure | error |
| agent_end | Stop | attention |
| session_before_compact | PreCompact | sweeping |
| session_compact | PostCompact | attention |
| session_shutdown | SessionEnd | remove session; idle if no live sessions |

Pi is state-only in DeskBuddy: DeskBuddy does not intercept permissions or add confirmation prompts, so Pi keeps its default YOLO execution behavior.

## Mini Mode

Drag to the right screen edge (or right-click → "Mini Mode") to enter mini mode — half-body visible at screen edge, peeking out on hover.

| Trigger | Mini Reaction | DeskBuddy | Calico | Cloudling |
|---|---|---|---|---|
| Default | Breathing + blinking + eye tracking | <img src="../../assets/gif/deskbuddy-mini-idle.gif" width="100"> | <img src="../../assets/gif/calico-mini-idle.gif" width="80"> | <img src="../../assets/gif/cloudling-mini-idle.gif" width="90"> |
| Hover | Peek out + wave | <img src="../../assets/gif/deskbuddy-mini-peek.gif" width="100"> | <img src="../../assets/gif/calico-mini-peek.gif" width="80"> | <img src="../../assets/gif/cloudling-mini-peek.gif" width="90"> |
| Notification | Alert pop | <img src="../../assets/gif/deskbuddy-mini-alert.gif" width="100"> | <img src="../../assets/gif/calico-mini-alert.gif" width="80"> | <img src="../../assets/gif/cloudling-mini-alert.gif" width="90"> |
| Task complete | Happy celebration | <img src="../../assets/gif/deskbuddy-mini-happy.gif" width="100"> | <img src="../../assets/gif/calico-mini-happy.gif" width="80"> | <img src="../../assets/gif/cloudling-mini-happy.gif" width="90"> |

## Click Reactions

Easter eggs — try double-clicking, rapid 4-clicks, or poking DeskBuddy repeatedly to discover hidden reactions.
