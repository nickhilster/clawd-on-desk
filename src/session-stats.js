"use strict";

function toNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

function getEntryActivityAt(entry) {
  return Math.max(
    toNumber(entry && entry.updatedAt),
    toNumber(entry && entry.metadataUpdatedAt),
    toNumber(entry && entry.lastEvent && entry.lastEvent.at)
  );
}

function incrementCounter(map, key, activityAt, updater) {
  const safeKey = key || "unknown";
  if (!map.has(safeKey)) {
    map.set(safeKey, { key: safeKey, count: 0, lastActivityAt: 0 });
  }
  const entry = map.get(safeKey);
  entry.count += 1;
  if (activityAt > entry.lastActivityAt) entry.lastActivityAt = activityAt;
  if (typeof updater === "function") updater(entry);
  return entry;
}

function sortSummaryEntries(entries) {
  return entries.slice().sort((a, b) => {
    if ((b.count || 0) !== (a.count || 0)) return (b.count || 0) - (a.count || 0);
    if ((b.lastActivityAt || 0) !== (a.lastActivityAt || 0)) {
      return (b.lastActivityAt || 0) - (a.lastActivityAt || 0);
    }
    return String(a.key || "").localeCompare(String(b.key || ""));
  });
}

function buildStatsSnapshot(sessionSnapshot, options = {}) {
  const sessions = Array.isArray(sessionSnapshot && sessionSnapshot.sessions)
    ? sessionSnapshot.sessions
    : [];
  const now = typeof options.now === "function" ? options.now() : Date.now();

  const byAgentMap = new Map();
  const byRepoMap = new Map();
  const byStateMap = new Map();
  const byBadgeMap = new Map();
  const byHostMap = new Map();

  let activeSessions = 0;
  let localSessions = 0;
  let remoteSessions = 0;
  let completedSessions = 0;
  let interruptedSessions = 0;
  let waitingForAckSessions = 0;
  let headlessSessions = 0;
  let hiddenFromHudSessions = 0;
  let contextTrackedSessions = 0;
  let contextNearLimitSessions = 0;
  let highestContextPercent = 0;
  let lastActivityAt = 0;

  for (const entry of sessions) {
    const activityAt = getEntryActivityAt(entry);
    if (activityAt > lastActivityAt) lastActivityAt = activityAt;

    const agentId = entry && entry.agentId ? entry.agentId : "unknown";
    const repoPath = entry && entry.repoPath ? entry.repoPath : "";
    const repoName = entry && entry.repoName ? entry.repoName : "";
    const repoKey = repoPath || repoName || "";
    const state = entry && entry.state ? entry.state : "idle";
    const badge = entry && entry.badge ? entry.badge : "idle";
    const host = entry && entry.host ? entry.host : "";
    const usage = entry && entry.contextUsage;

    if (badge === "running") activeSessions += 1;
    if (badge === "done") completedSessions += 1;
    if (badge === "interrupted") interruptedSessions += 1;
    if (entry && entry.requiresCompletionAck === true) waitingForAckSessions += 1;
    if (entry && entry.headless) headlessSessions += 1;
    if (entry && entry.hiddenFromHud) hiddenFromHudSessions += 1;
    if (host) remoteSessions += 1;
    else localSessions += 1;

    incrementCounter(byAgentMap, agentId, activityAt, (summary) => {
      if (badge === "running") summary.activeCount = (summary.activeCount || 0) + 1;
      if (badge === "done") summary.doneCount = (summary.doneCount || 0) + 1;
      if (badge === "interrupted") summary.interruptedCount = (summary.interruptedCount || 0) + 1;
    });
    if (repoKey) {
      incrementCounter(byRepoMap, repoKey, activityAt, (summary) => {
        summary.repoName = repoName || repoPath;
        summary.repoPath = repoPath || "";
        if (badge === "running") summary.activeCount = (summary.activeCount || 0) + 1;
      });
    }
    incrementCounter(byStateMap, state, activityAt);
    incrementCounter(byBadgeMap, badge, activityAt);
    if (host) {
      incrementCounter(byHostMap, host, activityAt, (summary) => {
        if (badge === "running") summary.activeCount = (summary.activeCount || 0) + 1;
      });
    }

    if (usage && typeof usage === "object") {
      contextTrackedSessions += 1;
      const percent = Number(usage.percent);
      if (Number.isFinite(percent)) {
        if (percent >= 80) contextNearLimitSessions += 1;
        if (percent > highestContextPercent) highestContextPercent = percent;
      }
    }
  }

  const byAgent = sortSummaryEntries(Array.from(byAgentMap.values())).map((entry) => ({
    agentId: entry.key,
    count: entry.count,
    activeCount: entry.activeCount || 0,
    doneCount: entry.doneCount || 0,
    interruptedCount: entry.interruptedCount || 0,
    lastActivityAt: entry.lastActivityAt || 0,
  }));
  const byRepo = sortSummaryEntries(Array.from(byRepoMap.values())).map((entry) => ({
    repoKey: entry.key,
    repoName: entry.repoName || entry.key,
    repoPath: entry.repoPath || "",
    count: entry.count,
    activeCount: entry.activeCount || 0,
    lastActivityAt: entry.lastActivityAt || 0,
  }));
  const byState = sortSummaryEntries(Array.from(byStateMap.values())).map((entry) => ({
    state: entry.key,
    count: entry.count,
    lastActivityAt: entry.lastActivityAt || 0,
  }));
  const byBadge = sortSummaryEntries(Array.from(byBadgeMap.values())).map((entry) => ({
    badge: entry.key,
    count: entry.count,
    lastActivityAt: entry.lastActivityAt || 0,
  }));
  const byHost = sortSummaryEntries(Array.from(byHostMap.values())).map((entry) => ({
    host: entry.key,
    count: entry.count,
    activeCount: entry.activeCount || 0,
    lastActivityAt: entry.lastActivityAt || 0,
  }));

  return {
    generatedAt: now,
    totals: {
      totalSessions: sessions.length,
      activeSessions,
      localSessions,
      remoteSessions,
      completedSessions,
      interruptedSessions,
      waitingForAckSessions,
      headlessSessions,
      hiddenFromHudSessions,
      trackedAgents: byAgent.length,
      trackedRepos: byRepo.length,
      remoteHosts: byHost.length,
      contextTrackedSessions,
      contextNearLimitSessions,
    },
    lastActivityAt: lastActivityAt || null,
    context: {
      trackedSessions: contextTrackedSessions,
      nearLimitSessions: contextNearLimitSessions,
      highestPercent: highestContextPercent,
    },
    byAgent,
    byRepo,
    byState,
    byBadge,
    byHost,
  };
}

module.exports = {
  buildStatsSnapshot,
  getEntryActivityAt,
};
