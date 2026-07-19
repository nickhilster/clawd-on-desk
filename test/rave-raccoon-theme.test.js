"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const themeLoader = require("../src/theme-loader");
const { collectRequiredAssetFiles } = require("../src/theme-schema");

themeLoader.init(path.join(__dirname, "..", "src"));

const THEME_DIR = path.join(__dirname, "..", "themes", "rave-raccoon");
const ASSETS_DIR = path.join(THEME_DIR, "assets");

function readAsset(filename) {
  return fs.readFileSync(path.join(ASSETS_DIR, filename), "utf8");
}

describe("built-in Rave Raccoon theme", () => {
  it("loads the complete Riff capability set", () => {
    const theme = themeLoader.loadTheme("rave-raccoon", { strict: true });

    assert.strictEqual(theme.name, "Rave Raccoon");
    assert.strictEqual(theme._builtin, true);
    assert.strictEqual(theme.sleepSequence.mode, "full");
    assert.deepStrictEqual(theme.states.idle, ["riff-idle.svg"]);
    assert.deepStrictEqual(theme.workingTiers.map((tier) => tier.file), [
      "riff-working-portal.svg",
      "riff-working-rave.svg",
      "riff-working-mix.svg",
    ]);
    assert.deepStrictEqual(theme.jugglingTiers.map((tier) => tier.file), [
      "riff-conducting.svg",
      "riff-juggling.svg",
    ]);
    assert.strictEqual(theme.idleAnimations.length, 3);
    assert.strictEqual(theme.miniMode.states["mini-working"][0], "riff-mini-working.svg");
    assert.deepStrictEqual(theme._capabilities, {
      eyeTracking: true,
      miniMode: true,
      idleAnimations: true,
      reactions: true,
      workingTiers: true,
      jugglingTiers: true,
      idleMode: "tracked",
      sleepMode: "full",
      powerProfile: "standard",
      movement: "roam",
    });
  });

  it("ships every referenced production asset", () => {
    const theme = themeLoader.loadTheme("rave-raccoon", { strict: true });
    const referenced = collectRequiredAssetFiles(theme);

    assert.strictEqual(referenced.length, 36);
    for (const filename of referenced) {
      assert.ok(fs.existsSync(path.join(ASSETS_DIR, filename)), `${filename} should exist`);
      assert.match(readAsset(filename), /<svg[\s>]/, `${filename} should be SVG`);
    }
  });

  it("keeps eye tracking and the limited-animation timing contract visible in source", () => {
    const idle = readAsset("riff-idle.svg");
    const dance = readAsset("riff-idle-dance.svg");

    assert.match(idle, /id="eyes-js"/);
    assert.match(idle, /id="body-js"/);
    assert.match(idle, /id="shadow-js"/);
    assert.match(idle, /steps\(1,end\)/);
    assert.match(dance, /@keyframes dance/);
    assert.match(dance, /steps\(1,end\)/);
    assert.doesNotMatch(idle, /<script|javascript:|(?:href|src)=["']https?:/i);
  });

  it("gives Riff optional short dialogue without adding a global UI dependency", () => {
    const dialogue = new Map([
      ["riff-idle-sidequest.svg", "SIDE QUEST?"],
      ["riff-thinking.svg", "PLOT TWIST..."],
      ["riff-working-mix.svg", "IN THE FLOW"],
      ["riff-notification.svg", "YO?"],
      ["riff-happy.svg", "NICE!"],
      ["riff-error.svg", "UH-OH"],
      ["riff-carrying.svg", "FOUND IT!"],
      ["riff-react-encore.svg", "ENCORE!"],
    ]);

    for (const [filename, line] of dialogue) {
      const asset = readAsset(filename);
      assert.ok(asset.includes(line), `${filename} should say "${line}"`);
      assert.match(asset, /chat-pop/);
    }
  });
});
