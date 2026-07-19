"use strict";

const BUILTIN_PLUGINS = Object.freeze([
  {
    id: "break-buddy",
    nameKey: "pluginBreakBuddyName",
    descriptionKey: "pluginBreakBuddyDesc",
    category: "wellness",
    defaultEnabled: true,
  },
  {
    id: "focus-buddy",
    nameKey: "pluginFocusBuddyName",
    descriptionKey: "pluginFocusBuddyDesc",
    category: "focus",
    defaultEnabled: true,
  },
  {
    id: "pet-pal",
    nameKey: "pluginPetPalName",
    descriptionKey: "pluginPetPalDesc",
    category: "deskbuddy",
    defaultEnabled: true,
  },
  {
    id: "quick-reminders",
    nameKey: "pluginQuickRemindersName",
    descriptionKey: "pluginQuickRemindersDesc",
    category: "wellness",
    defaultEnabled: true,
  },
  {
    id: "wander-buddy",
    nameKey: "pluginWanderBuddyName",
    descriptionKey: "pluginWanderBuddyDesc",
    category: "desktop",
    defaultEnabled: true,
  },
]);

const BUILTIN_PLUGIN_IDS = Object.freeze(BUILTIN_PLUGINS.map((plugin) => plugin.id));

function getBuiltInPlugin(pluginId) {
  return BUILTIN_PLUGINS.find((plugin) => plugin.id === pluginId) || null;
}

function getDefaultPetPluginPrefs() {
  const out = {};
  for (const plugin of BUILTIN_PLUGINS) {
    out[plugin.id] = { enabled: plugin.defaultEnabled !== false };
  }
  return out;
}

function normalizePetPluginPrefs(value, defaultsValue = getDefaultPetPluginPrefs()) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const defaults = defaultsValue && typeof defaultsValue === "object" && !Array.isArray(defaultsValue)
    ? defaultsValue
    : getDefaultPetPluginPrefs();
  const out = {};
  for (const plugin of BUILTIN_PLUGINS) {
    const base = defaults[plugin.id] && typeof defaults[plugin.id] === "object"
      ? defaults[plugin.id]
      : { enabled: plugin.defaultEnabled !== false };
    const entry = source[plugin.id] && typeof source[plugin.id] === "object"
      ? source[plugin.id]
      : null;
    out[plugin.id] = {
      enabled: entry && typeof entry.enabled === "boolean"
        ? entry.enabled
        : base.enabled !== false,
    };
  }
  return out;
}

function resolvePluginEnabled(snapshot, pluginId) {
  const defaults = getDefaultPetPluginPrefs();
  const entry = snapshot
    && snapshot.plugins
    && typeof snapshot.plugins === "object"
    && snapshot.plugins[pluginId]
    && typeof snapshot.plugins[pluginId] === "object"
    ? snapshot.plugins[pluginId]
    : null;
  if (entry && typeof entry.enabled === "boolean") return entry.enabled;
  return defaults[pluginId] ? defaults[pluginId].enabled !== false : false;
}

function createPetPluginActions(options = {}) {
  const tFallback = (key) => key;
  const timerState = {
    break: null,
    breakEndsAt: 0,
    focus: null,
    focusEndsAt: 0,
    reminder: null,
    reminderEndsAt: 0,
  };

  function now() {
    return typeof options.now === "function" ? Number(options.now()) || Date.now() : Date.now();
  }

  function readSnapshot() {
    return typeof options.getSnapshot === "function" ? (options.getSnapshot() || {}) : {};
  }

  function t(key, translate) {
    const resolver = typeof translate === "function" ? translate : tFallback;
    return resolver(key);
  }

  function notify(payload) {
    if (typeof options.notify !== "function") return;
    try {
      options.notify(payload);
    } catch (err) {
      console.warn("DeskBuddy: pet plugin notification failed:", err && err.message);
    }
  }

  function clearTimer(slot) {
    const handle = timerState[slot];
    if (handle && typeof clearTimeout === "function") clearTimeout(handle);
    timerState[slot] = null;
    timerState[`${slot}EndsAt`] = 0;
  }

  function scheduleTimer(slot, delayMs, queuedPayload, deliveredPayload) {
    clearTimer(slot);
    const safeDelay = Math.max(0, Number(delayMs) || 0);
    timerState[`${slot}EndsAt`] = now() + safeDelay;
    notify(queuedPayload);
    timerState[slot] = setTimeout(() => {
      timerState[slot] = null;
      timerState[`${slot}EndsAt`] = 0;
      notify(deliveredPayload);
    }, safeDelay);
    if (timerState[slot] && typeof timerState[slot].unref === "function") timerState[slot].unref();
  }

  function hasPendingTimer(slot) {
    return !!timerState[slot];
  }

  function toggleSetting(key, fallbackValue) {
    const snapshot = readSnapshot();
    const current = snapshot && typeof snapshot === "object" ? snapshot[key] : undefined;
    const next = typeof current === "boolean" ? !current : !!fallbackValue;
    if (typeof options.applyUpdate === "function") {
      return options.applyUpdate(key, next);
    }
    return { status: "error", message: `Cannot update ${key}` };
  }

  function runAction(actionName, fn) {
    return () => {
      try {
        const result = fn();
        if (result && typeof result.then === "function") {
          result.catch((err) => {
            console.warn(`DeskBuddy: pet plugin action failed (${actionName}):`, err && err.message);
          });
        }
      } catch (err) {
        console.warn(`DeskBuddy: pet plugin action failed (${actionName}):`, err && err.message);
      }
    };
  }

  function buildBreakBuddyCommands(translate) {
    return [
      {
        id: "break-5",
        titleKey: "pluginBreakBuddyMenuFive",
        click: runAction("break-5", () => {
          scheduleTimer(
            "break",
            5 * 60 * 1000,
            {
              title: t("pluginBreakBuddyQueuedTitle", translate),
              body: t("pluginBreakBuddyQueuedFive", translate),
            },
            {
              title: t("pluginBreakBuddyReadyTitle", translate),
              body: t("pluginBreakBuddyReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "break-10",
        titleKey: "pluginBreakBuddyMenuTen",
        click: runAction("break-10", () => {
          scheduleTimer(
            "break",
            10 * 60 * 1000,
            {
              title: t("pluginBreakBuddyQueuedTitle", translate),
              body: t("pluginBreakBuddyQueuedTen", translate),
            },
            {
              title: t("pluginBreakBuddyReadyTitle", translate),
              body: t("pluginBreakBuddyReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "cancel-break",
        titleKey: "pluginBreakBuddyMenuCancel",
        enabled: () => hasPendingTimer("break"),
        click: runAction("cancel-break", () => {
          clearTimer("break");
          notify({
            title: t("pluginBreakBuddyQueuedTitle", translate),
            body: t("pluginBreakBuddyCanceledBody", translate),
          });
        }),
      },
    ];
  }

  function buildFocusBuddyCommands(translate) {
    return [
      {
        id: "focus-25",
        titleKey: "pluginFocusBuddyMenuTwentyFive",
        click: runAction("focus-25", () => {
          scheduleTimer(
            "focus",
            25 * 60 * 1000,
            {
              title: t("pluginFocusBuddyQueuedTitle", translate),
              body: t("pluginFocusBuddyQueuedTwentyFive", translate),
            },
            {
              title: t("pluginFocusBuddyReadyTitle", translate),
              body: t("pluginFocusBuddyReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "focus-50",
        titleKey: "pluginFocusBuddyMenuFifty",
        click: runAction("focus-50", () => {
          scheduleTimer(
            "focus",
            50 * 60 * 1000,
            {
              title: t("pluginFocusBuddyQueuedTitle", translate),
              body: t("pluginFocusBuddyQueuedFifty", translate),
            },
            {
              title: t("pluginFocusBuddyReadyTitle", translate),
              body: t("pluginFocusBuddyReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "cancel-focus",
        titleKey: "pluginFocusBuddyMenuCancel",
        enabled: () => hasPendingTimer("focus"),
        click: runAction("cancel-focus", () => {
          clearTimer("focus");
          notify({
            title: t("pluginFocusBuddyQueuedTitle", translate),
            body: t("pluginFocusBuddyCanceledBody", translate),
          });
        }),
      },
    ];
  }

  function buildPetPalCommands(translate) {
    return [
      {
        id: "open-dashboard",
        titleKey: "pluginPetPalMenuDashboard",
        click: runAction("open-dashboard", () => {
          if (typeof options.openDashboard === "function") options.openDashboard();
        }),
      },
      {
        id: "open-stats",
        titleKey: "pluginPetPalMenuStats",
        click: runAction("open-stats", () => {
          if (typeof options.openSettingsTab === "function") options.openSettingsTab("stats");
        }),
      },
      {
        id: "open-agents",
        titleKey: "pluginPetPalMenuAgents",
        click: runAction("open-agents", () => {
          if (typeof options.openSettingsTab === "function") options.openSettingsTab("agents");
        }),
      },
    ];
  }

  function buildQuickReminderCommands(translate) {
    return [
      {
        id: "remind-10",
        titleKey: "pluginQuickRemindersMenuTen",
        click: runAction("remind-10", () => {
          scheduleTimer(
            "reminder",
            10 * 60 * 1000,
            {
              title: t("pluginQuickRemindersQueuedTitle", translate),
              body: t("pluginQuickRemindersQueuedTen", translate),
            },
            {
              title: t("pluginQuickRemindersReadyTitle", translate),
              body: t("pluginQuickRemindersReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "remind-30",
        titleKey: "pluginQuickRemindersMenuThirty",
        click: runAction("remind-30", () => {
          scheduleTimer(
            "reminder",
            30 * 60 * 1000,
            {
              title: t("pluginQuickRemindersQueuedTitle", translate),
              body: t("pluginQuickRemindersQueuedThirty", translate),
            },
            {
              title: t("pluginQuickRemindersReadyTitle", translate),
              body: t("pluginQuickRemindersReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "remind-60",
        titleKey: "pluginQuickRemindersMenuHour",
        click: runAction("remind-60", () => {
          scheduleTimer(
            "reminder",
            60 * 60 * 1000,
            {
              title: t("pluginQuickRemindersQueuedTitle", translate),
              body: t("pluginQuickRemindersQueuedHour", translate),
            },
            {
              title: t("pluginQuickRemindersReadyTitle", translate),
              body: t("pluginQuickRemindersReadyBody", translate),
            }
          );
        }),
      },
      {
        id: "cancel-reminder",
        titleKey: "pluginQuickRemindersMenuCancel",
        enabled: () => hasPendingTimer("reminder"),
        click: runAction("cancel-reminder", () => {
          clearTimer("reminder");
          notify({
            title: t("pluginQuickRemindersQueuedTitle", translate),
            body: t("pluginQuickRemindersCanceledBody", translate),
          });
        }),
      },
    ];
  }

  function buildWanderBuddyCommands(translate) {
    return [
      {
        id: "toggle-free-roam",
        titleKey: "pluginWanderBuddyMenuFreeRoam",
        type: "checkbox",
        checked: () => {
          const snapshot = readSnapshot();
          return snapshot && snapshot.freeRoam === true;
        },
        click: runAction("toggle-free-roam", () => toggleSetting("freeRoam", true)),
      },
      {
        id: "toggle-edge-pinning",
        titleKey: "pluginWanderBuddyMenuEdgePinning",
        type: "checkbox",
        checked: () => {
          const snapshot = readSnapshot();
          return snapshot && snapshot.allowEdgePinning === true;
        },
        click: runAction("toggle-edge-pinning", () => toggleSetting("allowEdgePinning", true)),
      },
    ];
  }

  function getPluginCommands(pluginId, translate) {
    switch (pluginId) {
      case "break-buddy": return buildBreakBuddyCommands(translate);
      case "focus-buddy": return buildFocusBuddyCommands(translate);
      case "pet-pal": return buildPetPalCommands(translate);
      case "quick-reminders": return buildQuickReminderCommands(translate);
      case "wander-buddy": return buildWanderBuddyCommands(translate);
      default: return [];
    }
  }

  function createMenuItem(command, translate) {
    const label = t(command.titleKey, translate);
    const enabled = typeof command.enabled === "function" ? !!command.enabled() : command.enabled !== false;
    if (command.type === "checkbox") {
      return {
        label,
        type: "checkbox",
        enabled,
        checked: typeof command.checked === "function" ? !!command.checked() : !!command.checked,
        click: typeof command.click === "function" ? command.click : undefined,
      };
    }
    return {
      label,
      enabled,
      click: typeof command.click === "function" ? command.click : undefined,
    };
  }

  function getMenuTemplate({ t: translate = tFallback } = {}) {
    const snapshot = readSnapshot();
    return BUILTIN_PLUGINS
      .filter((plugin) => resolvePluginEnabled(snapshot, plugin.id))
      .map((plugin) => ({
        label: t(plugin.nameKey, translate),
        submenu: getPluginCommands(plugin.id, translate).map((command) => createMenuItem(command, translate)),
      }))
      .filter((item) => Array.isArray(item.submenu) && item.submenu.length > 0);
  }

  function listPlugins() {
    const snapshot = readSnapshot();
    return BUILTIN_PLUGINS.map((plugin) => ({
      id: plugin.id,
      nameKey: plugin.nameKey,
      descriptionKey: plugin.descriptionKey,
      category: plugin.category,
      bundled: true,
      featuredInMenu: true,
      enabled: resolvePluginEnabled(snapshot, plugin.id),
      commandCount: getPluginCommands(plugin.id, tFallback).length,
    }));
  }

  function getSettingsSnapshot() {
    return {
      generatedAt: now(),
      plugins: listPlugins().map((plugin) => ({
        ...plugin,
        commands: getPluginCommands(plugin.id, tFallback).map((command) => ({
          id: command.id,
          titleKey: command.titleKey,
          type: command.type || "normal",
          checked: typeof command.checked === "function" ? !!command.checked() : !!command.checked,
          enabled: typeof command.enabled === "function" ? !!command.enabled() : command.enabled !== false,
        })),
      })),
    };
  }

  function runCommand(pluginId, commandId) {
    const command = getPluginCommands(pluginId, tFallback).find((entry) => entry.id === commandId);
    if (!command) return { status: "error", message: `Unknown pet plugin command: ${pluginId}/${commandId}` };
    if (typeof command.enabled === "function" && !command.enabled()) {
      return { status: "error", message: `Pet plugin command is disabled: ${pluginId}/${commandId}` };
    }
    if (typeof command.click === "function") {
      command.click();
      return { status: "ok" };
    }
    return { status: "error", message: `Pet plugin command is not runnable: ${pluginId}/${commandId}` };
  }

  return {
    getMenuTemplate,
    getSettingsSnapshot,
    listPlugins,
    runCommand,
  };
}

module.exports = {
  BUILTIN_PLUGINS,
  BUILTIN_PLUGIN_IDS,
  createPetPluginActions,
  getBuiltInPlugin,
  getDefaultPetPluginPrefs,
  normalizePetPluginPrefs,
  resolvePluginEnabled,
};
