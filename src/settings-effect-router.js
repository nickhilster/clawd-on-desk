"use strict";

const MENU_AFFECTING_KEYS = new Set([
  "lang",
  "soundMuted",
  "bubbleFollowPet",
  "hideBubbles",
  "permissionBubblesEnabled",
  "autoApproveAllPermissions",
  "notificationBubbleAutoCloseSeconds",
  "permissionBubbleAutoCloseSeconds",
  "updateBubbleAutoCloseSeconds",
  "manageClaudeHooksAutomatically",
  "autoStartWithClaude",
  "openAtLogin",
  "showTray",
  "showDock",
  "theme",
  "size",
  "sessionAliases",
  "disableMiniMode",
]);

function requiredDependency(value, name) {
  if (!value) throw new Error(`createSettingsEffectRouter requires ${name}`);
  return value;
}

function noop() {}

function warn(logWarn, message, err) {
  try {
    logWarn(message, err && err.message);
  } catch {}
}

function safeCall(logWarn, message, fn, ...args) {
  if (typeof fn !== "function") return undefined;
  try {
    return fn(...args);
  } catch (err) {
    warn(logWarn, message, err);
    return undefined;
  }
}

function createSettingsEffectRouter(options = {}) {
  const settingsController = requiredDependency(options.settingsController, "settingsController");
  const BrowserWindow = options.BrowserWindow || { getAllWindows: () => [] };
  const logWarn = options.logWarn || console.warn;
  const updateMirrors = options.updateMirrors || noop;
  const createTray = options.createTray || noop;
  const destroyTray = options.destroyTray || noop;
  const applyDockVisibility = options.applyDockVisibility || noop;
  const sendToRenderer = options.sendToRenderer || noop;
  const sendDashboardI18n = options.sendDashboardI18n || noop;
  const sendSessionHudI18n = options.sendSessionHudI18n || noop;
  const emitSessionSnapshot = options.emitSessionSnapshot || noop;
  const cleanStaleSessions = options.cleanStaleSessions || noop;
  const syncPermissionShortcuts = options.syncPermissionShortcuts || noop;
  const dismissInteractivePermissionBubbles = options.dismissInteractivePermissionBubbles || noop;
  const clearCodexNotifyBubbles = options.clearCodexNotifyBubbles || noop;
  const clearKimiNotifyBubbles = options.clearKimiNotifyBubbles || noop;
  const refreshPassiveNotifyAutoClose = options.refreshPassiveNotifyAutoClose || noop;
  const refreshPermissionAutoCloseForPolicy = options.refreshPermissionAutoCloseForPolicy || noop;
  const hideUpdateBubbleForPolicy = options.hideUpdateBubbleForPolicy || noop;
  const refreshUpdateBubbleAutoClose = options.refreshUpdateBubbleAutoClose || noop;
  const repositionFloatingBubbles = options.repositionFloatingBubbles || noop;
  const applyTextScale = options.applyTextScale || noop;
  const syncSessionHudVisibility = options.syncSessionHudVisibility || noop;
  const handleSessionHudPinnedChanged = options.handleSessionHudPinnedChanged || noop;
  const reclampPetAfterEdgePinningChange = options.reclampPetAfterEdgePinningChange || noop;
  const exitMiniMode = options.exitMiniMode || noop;
  const getMiniMode = options.getMiniMode || (() => false);
  const rebuildAllMenus = options.rebuildAllMenus || noop;
  const reconcilePowerSaveBlocker = options.reconcilePowerSaveBlocker || noop;

  let started = false;
  let unsubscribeSettings = null;
  let unsubscribeShortcuts = null;
  let lastTogglePetShortcut = ((settingsController.getSnapshot().shortcuts) || {}).togglePet || null;

  function handleSettingsChange({ changes } = {}) {
    if (!changes || typeof changes !== "object") return;

    // 1. Update mirror caches first so any side-effect handler reads fresh values.
    updateMirrors(changes);

    if ("showTray" in changes) {
      safeCall(
        logWarn,
        "DeskBuddy: tray toggle failed:",
        changes.showTray ? createTray : destroyTray
      );
    }
    if ("showDock" in changes) {
      safeCall(logWarn, "DeskBuddy: applyDockVisibility failed:", applyDockVisibility);
    }
    if ("lowPowerIdleMode" in changes) {
      sendToRenderer("low-power-idle-mode-change", changes.lowPowerIdleMode);
    }
    if ("keepAwakeWhileWorking" in changes) {
      safeCall(logWarn, "DeskBuddy: reconcilePowerSaveBlocker failed:", reconcilePowerSaveBlocker);
    }
    if ("lang" in changes) {
      safeCall(logWarn, "DeskBuddy: dashboard lang broadcast failed:", sendDashboardI18n);
      safeCall(logWarn, "DeskBuddy: session HUD lang broadcast failed:", sendSessionHudI18n);
    }
    if ("sessionAliases" in changes) {
      safeCall(
        logWarn,
        "DeskBuddy: session alias snapshot broadcast failed:",
        emitSessionSnapshot,
        { force: true }
      );
    }

    // 2. Reactive side effects.
    if ("hideBubbles" in changes || "permissionBubblesEnabled" in changes) {
      safeCall(logWarn, "DeskBuddy: syncPermissionShortcuts failed:", syncPermissionShortcuts);
    }
    if (
      ("permissionBubblesEnabled" in changes && changes.permissionBubblesEnabled === false) ||
      ("hideBubbles" in changes && changes.hideBubbles === true)
    ) {
      safeCall(
        logWarn,
        "DeskBuddy: dismiss interactive bubbles failed:",
        dismissInteractivePermissionBubbles
      );
    }
    if (
      ("notificationBubbleAutoCloseSeconds" in changes && changes.notificationBubbleAutoCloseSeconds === 0) ||
      ("hideBubbles" in changes && changes.hideBubbles === true)
    ) {
      try {
        clearCodexNotifyBubbles(undefined, "settings-policy-disabled");
        clearKimiNotifyBubbles(undefined, "settings-policy-disabled");
      } catch (err) {
        warn(logWarn, "DeskBuddy: clear notification bubbles failed:", err);
      }
    } else if (
      "notificationBubbleAutoCloseSeconds" in changes &&
      changes.notificationBubbleAutoCloseSeconds > 0
    ) {
      safeCall(
        logWarn,
        "DeskBuddy: refresh notification bubble timers failed:",
        refreshPassiveNotifyAutoClose
      );
    }
    if (
      ("updateBubbleAutoCloseSeconds" in changes && changes.updateBubbleAutoCloseSeconds === 0) ||
      ("hideBubbles" in changes && changes.hideBubbles === true)
    ) {
      safeCall(logWarn, "DeskBuddy: hide update bubble failed:", hideUpdateBubbleForPolicy);
    } else if (
      "updateBubbleAutoCloseSeconds" in changes &&
      changes.updateBubbleAutoCloseSeconds > 0
    ) {
      safeCall(
        logWarn,
        "DeskBuddy: refresh update bubble timer failed:",
        refreshUpdateBubbleAutoClose
      );
    }
    // Permission autoclose: any change (including 0 = disable) needs to be
    // pushed into pending entries so they re-arm or clear timers.
    if ("permissionBubbleAutoCloseSeconds" in changes) {
      safeCall(
        logWarn,
        "DeskBuddy: refresh permission bubble timer failed:",
        refreshPermissionAutoCloseForPolicy
      );
    }
    if ("bubbleFollowPet" in changes) {
      safeCall(logWarn, "DeskBuddy: repositionFloatingBubbles failed:", repositionFloatingBubbles);
    }
    if ("textScale" in changes || "textScaleByDisplay" in changes) {
      // applyTextScale owns the whole cascade: per-display zoom on live text
      // windows, fixed-width window resize, and bubble/HUD repositioning.
      safeCall(logWarn, "DeskBuddy: applyTextScale failed:", applyTextScale);
    }
    if ("sessionHudPinned" in changes) {
      // Pinned transitions are handled inside session-hud.js so the visible
      // state can be inspected BEFORE the new mirror takes effect during a
      // generic sync. handlePinnedChanged internally calls syncSessionHud,
      // which triggers reposition via the reserved-offset callback — no
      // need to call repositionFloatingBubbles here as well.
      try {
        handleSessionHudPinnedChanged(changes.sessionHudPinned);
      } catch (err) {
        warn(logWarn, "DeskBuddy: session HUD pinned change failed:", err);
      }
    }
    if (
      "sessionHudEnabled" in changes
      || "sessionHudShowStateLabels" in changes
      || "sessionHudShowElapsed" in changes
      || "sessionHudShowContextUsage" in changes
    ) {
      try {
        syncSessionHudVisibility();
        repositionFloatingBubbles();
      } catch (err) {
        warn(logWarn, "DeskBuddy: session HUD setting sync failed:", err);
      }
    }
    if ("sessionHudCleanupDetached" in changes && changes.sessionHudCleanupDetached === true) {
      try {
        cleanStaleSessions();
        emitSessionSnapshot({ force: true });
      } catch (err) {
        warn(logWarn, "DeskBuddy: detached session cleanup sweep failed:", err);
      }
    } else if ("sessionHudCleanupDetached" in changes) {
      safeCall(
        logWarn,
        "DeskBuddy: detached session cleanup snapshot refresh failed:",
        emitSessionSnapshot,
        { force: true }
      );
    }
    if (
      "sessionStaleMs" in changes
      || "workingStaleMs" in changes
      || "detachedIdleStaleMs" in changes
    ) {
      try {
        cleanStaleSessions();
        emitSessionSnapshot({ force: true });
      } catch (err) {
        warn(logWarn, "DeskBuddy: stale cleanup config refresh failed:", err);
      }
    }
    if ("allowEdgePinning" in changes) {
      safeCall(
        logWarn,
        "DeskBuddy: allowEdgePinning re-clamp failed:",
        reclampPetAfterEdgePinningChange
      );
    }
    if ("disableMiniMode" in changes && changes.disableMiniMode && getMiniMode()) {
      safeCall(logWarn, "DeskBuddy: disableMiniMode exit failed:", exitMiniMode);
    }

    // 3. Menu rebuild: only for menu-affecting keys to avoid thrashing on
    // window position / mini state changes.
    for (const key of Object.keys(changes)) {
      if (MENU_AFFECTING_KEYS.has(key)) {
        safeCall(logWarn, "DeskBuddy: rebuildAllMenus failed:", rebuildAllMenus);
        break;
      }
    }

    // 4. Broadcast to all renderer windows for the future settings panel.
    try {
      for (const bw of BrowserWindow.getAllWindows()) {
        if (!bw.isDestroyed() && bw.webContents && !bw.webContents.isDestroyed()) {
          bw.webContents.send("settings-changed", {
            changes,
            snapshot: settingsController.getSnapshot(),
          });
        }
      }
    } catch (err) {
      warn(logWarn, "DeskBuddy: settings-changed broadcast failed:", err);
    }
  }

  function handleShortcutsChange(_value, snapshot) {
    const nextTogglePetShortcut = (snapshot && snapshot.shortcuts && snapshot.shortcuts.togglePet) || null;
    if (nextTogglePetShortcut === lastTogglePetShortcut) return;
    lastTogglePetShortcut = nextTogglePetShortcut;
    safeCall(logWarn, "DeskBuddy: rebuildAllMenus failed:", rebuildAllMenus);
  }

  function start() {
    if (started) return;
    started = true;
    unsubscribeSettings = settingsController.subscribe(handleSettingsChange);
    unsubscribeShortcuts = settingsController.subscribeKey("shortcuts", handleShortcutsChange);
  }

  function dispose() {
    if (typeof unsubscribeShortcuts === "function") unsubscribeShortcuts();
    if (typeof unsubscribeSettings === "function") unsubscribeSettings();
    unsubscribeShortcuts = null;
    unsubscribeSettings = null;
    started = false;
  }

  return {
    start,
    dispose,
  };
}

module.exports = createSettingsEffectRouter;
module.exports.MENU_AFFECTING_KEYS = MENU_AFFECTING_KEYS;
