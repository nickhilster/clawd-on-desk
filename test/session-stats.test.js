"use strict";

const test = require("node:test");
const assert = require("node:assert");

const { buildStatsSnapshot, getEntryActivityAt } = require("../src/session-stats");

test("getEntryActivityAt prefers the freshest timestamp on a session entry", () => {
  assert.strictEqual(getEntryActivityAt({
    updatedAt: 100,
    metadataUpdatedAt: 200,
    lastEvent: { at: 150 },
  }), 200);
});

test("buildStatsSnapshot derives agent, repo, state, and remote totals from a session snapshot", () => {
  const stats = buildStatsSnapshot({
    sessions: [
      {
        id: "codex:1",
        agentId: "codex",
        repoName: "deskbuddy",
        repoPath: "C:\\dev\\deskbuddy",
        state: "working",
        badge: "running",
        updatedAt: 1000,
        contextUsage: { used: 1000, limit: 2000, percent: 50 },
        lastEvent: { at: 1000 },
      },
      {
        id: "claude:1",
        agentId: "claude-code",
        repoName: "deskbuddy",
        repoPath: "C:\\dev\\deskbuddy",
        state: "idle",
        badge: "done",
        requiresCompletionAck: true,
        host: "prod-box",
        updatedAt: 2000,
        contextUsage: { used: 1800, limit: 2000, percent: 90 },
        lastEvent: { at: 2000 },
      },
      {
        id: "cursor:1",
        agentId: "cursor-agent",
        state: "idle",
        badge: "interrupted",
        host: "prod-box",
        updatedAt: 1500,
        headless: true,
        hiddenFromHud: true,
        lastEvent: { at: 1500 },
      },
    ],
  }, { now: () => 5000 });

  assert.strictEqual(stats.generatedAt, 5000);
  assert.deepStrictEqual(stats.totals, {
    totalSessions: 3,
    activeSessions: 1,
    localSessions: 1,
    remoteSessions: 2,
    completedSessions: 1,
    interruptedSessions: 1,
    waitingForAckSessions: 1,
    headlessSessions: 1,
    hiddenFromHudSessions: 1,
    trackedAgents: 3,
    trackedRepos: 1,
    remoteHosts: 1,
    contextTrackedSessions: 2,
    contextNearLimitSessions: 1,
  });
  assert.strictEqual(stats.lastActivityAt, 2000);
  assert.deepStrictEqual(stats.context, {
    trackedSessions: 2,
    nearLimitSessions: 1,
    highestPercent: 90,
  });
  assert.deepStrictEqual(stats.byAgent.map((entry) => entry.agentId), [
    "claude-code",
    "cursor-agent",
    "codex",
  ]);
  assert.deepStrictEqual(stats.byRepo[0], {
    repoKey: "C:\\dev\\deskbuddy",
    repoName: "deskbuddy",
    repoPath: "C:\\dev\\deskbuddy",
    count: 2,
    activeCount: 1,
    lastActivityAt: 2000,
  });
  assert.deepStrictEqual(stats.byState.map((entry) => [entry.state, entry.count]), [
    ["idle", 2],
    ["working", 1],
  ]);
  assert.deepStrictEqual(stats.byBadge.map((entry) => [entry.badge, entry.count]), [
    ["done", 1],
    ["interrupted", 1],
    ["running", 1],
  ]);
  assert.deepStrictEqual(stats.byHost, [
    { host: "prod-box", count: 2, activeCount: 0, lastActivityAt: 2000 },
  ]);
});
