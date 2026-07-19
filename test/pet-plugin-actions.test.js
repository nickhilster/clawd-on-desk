"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  BUILTIN_PLUGIN_IDS,
  createPetPluginActions,
  getDefaultPetPluginPrefs,
  normalizePetPluginPrefs,
} = require("../src/pet-plugin-actions");

test("pet plugin defaults cover every bundled plugin", () => {
  const defaults = getDefaultPetPluginPrefs();
  assert.deepStrictEqual(Object.keys(defaults).sort(), [...BUILTIN_PLUGIN_IDS].sort());
  for (const pluginId of BUILTIN_PLUGIN_IDS) {
    assert.equal(typeof defaults[pluginId].enabled, "boolean");
  }
});

test("pet plugin prefs normalization keeps only bundled plugin ids", () => {
  const normalized = normalizePetPluginPrefs({
    "break-buddy": { enabled: false },
    "not-real": { enabled: true },
  });
  assert.deepStrictEqual(Object.keys(normalized).sort(), [...BUILTIN_PLUGIN_IDS].sort());
  assert.equal(normalized["break-buddy"].enabled, false);
  assert.equal("not-real" in normalized, false);
});

test("pet plugin menu only includes enabled bundled plugins", () => {
  const actions = createPetPluginActions({
    getSnapshot: () => ({
      plugins: normalizePetPluginPrefs({
        "break-buddy": { enabled: true },
        "focus-buddy": { enabled: false },
      }),
      freeRoam: false,
      allowEdgePinning: false,
    }),
    applyUpdate: () => ({ status: "ok" }),
  });

  const menu = actions.getMenuTemplate({ t: (key) => key });
  assert.ok(menu.some((item) => item.label === "pluginBreakBuddyName"));
  assert.ok(menu.some((item) => item.label === "pluginPetPalName"));
  assert.ok(!menu.some((item) => item.label === "pluginFocusBuddyName"));
});

test("pet plugin command execution routes built-in actions", () => {
  const calls = [];
  const actions = createPetPluginActions({
    getSnapshot: () => ({
      plugins: getDefaultPetPluginPrefs(),
      freeRoam: false,
      allowEdgePinning: false,
    }),
    openSettingsTab: (tabId) => calls.push(tabId),
    applyUpdate: () => ({ status: "ok" }),
  });

  assert.deepStrictEqual(actions.runCommand("pet-pal", "open-stats"), { status: "ok" });
  assert.deepStrictEqual(calls, ["stats"]);
});
