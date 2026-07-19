"use strict";

(function initSettingsTabStats(root) {
  let state = null;
  let runtime = null;
  let helpers = null;
  let ops = null;

  const view = {
    snapshot: null,
    loading: false,
    error: "",
    seq: 0,
    fetchedAt: 0,
  };

  const MAX_LIST_ROWS = 6;
  const REFRESH_STALE_MS = 10_000;

  function t(key) {
    return helpers.t(key);
  }

  function shouldRefresh() {
    if (!view.snapshot) return true;
    return (Date.now() - view.fetchedAt) > REFRESH_STALE_MS;
  }

  function fetchStats({ forceRender = false } = {}) {
    if (view.loading) return;
    if (!window.settingsAPI || typeof window.settingsAPI.getStatsSnapshot !== "function") {
      view.error = "settings API unavailable";
      return;
    }
    view.loading = true;
    const seq = ++view.seq;
    window.settingsAPI.getStatsSnapshot().then((snapshot) => {
      if (seq !== view.seq) return;
      view.loading = false;
      view.error = "";
      view.snapshot = snapshot || null;
      view.fetchedAt = Date.now();
      if (forceRender && state.activeTab === "stats") ops.requestRender({ content: true });
    }).catch((err) => {
      if (seq !== view.seq) return;
      view.loading = false;
      view.error = err && err.message ? err.message : "stats unavailable";
      if (forceRender && state.activeTab === "stats") ops.requestRender({ content: true });
    });
  }

  function render(parent) {
    if (!view.loading && shouldRefresh()) fetchStats({ forceRender: true });

    const h1 = document.createElement("h1");
    h1.textContent = t("statsTitle");
    parent.appendChild(h1);

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent = t("statsSubtitle");
    parent.appendChild(subtitle);

    if (view.error && !view.snapshot) {
      parent.appendChild(buildMessageSection(t("statsLoadFailed"), view.error));
      return;
    }
    if (!view.snapshot) {
      parent.appendChild(buildMessageSection(t("statsLoadingTitle"), t("statsLoadingBody")));
      return;
    }
    if (!view.snapshot.totals || view.snapshot.totals.totalSessions === 0) {
      parent.appendChild(buildMessageSection(t("statsEmptyTitle"), t("statsEmptyBody")));
      return;
    }

    parent.appendChild(buildOverviewSection(view.snapshot));
    parent.appendChild(buildSummaryListSection(
      t("statsAgentsTitle"),
      t("statsAgentsEmpty"),
      view.snapshot.byAgent,
      buildAgentRow
    ));
    parent.appendChild(buildSummaryListSection(
      t("statsProjectsTitle"),
      t("statsProjectsEmpty"),
      view.snapshot.byRepo,
      buildRepoRow
    ));
    parent.appendChild(buildSummaryListSection(
      t("statsStatusTitle"),
      t("statsStatusEmpty"),
      view.snapshot.byState,
      buildStateRow
    ));
    parent.appendChild(buildHealthSection(view.snapshot));
  }

  function buildMessageSection(title, body) {
    const section = document.createElement("section");
    section.className = "stats-empty";
    const titleNode = document.createElement("div");
    titleNode.className = "stats-empty-title";
    titleNode.textContent = title;
    section.appendChild(titleNode);
    const bodyNode = document.createElement("div");
    bodyNode.className = "stats-empty-body";
    bodyNode.textContent = body;
    section.appendChild(bodyNode);
    return section;
  }

  function buildOverviewSection(snapshot) {
    const totals = snapshot.totals || {};
    const section = document.createElement("section");
    section.className = "stats-grid";
    section.appendChild(buildStatCard(
      t("statsCardSessions"),
      totals.totalSessions,
      `${totals.localSessions} ${t("statsLocalLabel")} · ${totals.remoteSessions} ${t("statsRemoteLabel")}`
    ));
    section.appendChild(buildStatCard(
      t("statsCardActive"),
      totals.activeSessions,
      formatLastActive(snapshot.lastActivityAt)
    ));
    section.appendChild(buildStatCard(
      t("statsCardNeedsAck"),
      totals.waitingForAckSessions,
      `${totals.completedSessions} ${t("statsDoneLabel")} · ${totals.interruptedSessions} ${t("statsInterruptedLabel")}`
    ));
    section.appendChild(buildStatCard(
      t("statsCardCoverage"),
      totals.trackedAgents,
      `${totals.trackedRepos} ${t("statsReposLabel")} · ${totals.remoteHosts} ${t("statsHostsLabel")}`
    ));
    return section;
  }

  function buildStatCard(label, value, foot) {
    const card = document.createElement("article");
    card.className = "stats-card";
    const labelNode = document.createElement("div");
    labelNode.className = "stats-card-label";
    labelNode.textContent = label;
    card.appendChild(labelNode);
    const valueNode = document.createElement("div");
    valueNode.className = "stats-card-value";
    valueNode.textContent = Number(value || 0).toLocaleString();
    card.appendChild(valueNode);
    const footNode = document.createElement("div");
    footNode.className = "stats-card-foot";
    footNode.textContent = foot;
    card.appendChild(footNode);
    return card;
  }

  function buildSummaryListSection(title, emptyText, entries, rowBuilder) {
    const section = document.createElement("section");
    section.className = "section";
    const heading = document.createElement("h2");
    heading.className = "section-title";
    heading.textContent = title;
    section.appendChild(heading);

    const list = document.createElement("div");
    list.className = "stats-list";
    const limited = Array.isArray(entries) ? entries.slice(0, MAX_LIST_ROWS) : [];
    if (!limited.length) {
      const empty = document.createElement("div");
      empty.className = "stats-empty-inline";
      empty.textContent = emptyText;
      list.appendChild(empty);
    } else {
      const maxCount = Math.max(...limited.map((entry) => Number(entry && entry.count) || 0), 1);
      for (const entry of limited) {
        list.appendChild(rowBuilder(entry, maxCount));
      }
    }
    section.appendChild(list);
    return section;
  }

  function buildAgentRow(entry, maxCount) {
    const meta = Array.isArray(runtime.agentMetadata)
      ? runtime.agentMetadata.find((item) => item && item.id === entry.agentId)
      : null;
    const label = meta && meta.name ? meta.name : humanizeId(entry.agentId);
    return buildBarRow({
      label,
      meta: `${entry.activeCount} ${t("statsActiveShort")} · ${formatLastActive(entry.lastActivityAt)}`,
      value: entry.count,
      maxCount,
    });
  }

  function buildRepoRow(entry, maxCount) {
    return buildBarRow({
      label: entry.repoName || t("statsUnknownRepo"),
      meta: entry.repoPath || `${entry.activeCount} ${t("statsActiveShort")}`,
      value: entry.count,
      maxCount,
    });
  }

  function buildStateRow(entry, maxCount) {
    return buildBarRow({
      label: describeState(entry.state),
      meta: formatLastActive(entry.lastActivityAt),
      value: entry.count,
      maxCount,
    });
  }

  function buildBarRow({ label, meta, value, maxCount }) {
    const item = document.createElement("div");
    item.className = "stats-list-item";

    const head = document.createElement("div");
    head.className = "stats-list-head";
    const labelNode = document.createElement("div");
    labelNode.className = "stats-list-label";
    labelNode.textContent = label;
    head.appendChild(labelNode);
    const valueNode = document.createElement("div");
    valueNode.className = "stats-list-value";
    valueNode.textContent = Number(value || 0).toLocaleString();
    head.appendChild(valueNode);
    item.appendChild(head);

    const bar = document.createElement("div");
    bar.className = "stats-bar";
    const fill = document.createElement("div");
    fill.className = "stats-bar-fill";
    fill.style.width = `${Math.max(8, Math.round(((Number(value) || 0) / Math.max(1, maxCount)) * 100))}%`;
    bar.appendChild(fill);
    item.appendChild(bar);

    const metaNode = document.createElement("div");
    metaNode.className = "stats-list-meta";
    metaNode.textContent = meta;
    item.appendChild(metaNode);

    return item;
  }

  function buildHealthSection(snapshot) {
    const totals = snapshot.totals || {};
    const context = snapshot.context || {};
    const rows = [
      buildHealthRow(t("statsHealthLastActivity"), formatLastActive(snapshot.lastActivityAt)),
      buildHealthRow(
        t("statsHealthContext"),
        `${totals.contextTrackedSessions} ${t("statsTrackedLabel")} · ${totals.contextNearLimitSessions} ${t("statsNearLimitLabel")} · ${Math.round(context.highestPercent || 0)}% ${t("statsPeakLabel")}`
      ),
      buildHealthRow(
        t("statsHealthRemote"),
        `${totals.remoteHosts} ${t("statsHostsLabel")} · ${totals.remoteSessions} ${t("statsSessionsLabel")}`
      ),
    ];
    return helpers.buildSection(t("statsHealthTitle"), rows);
  }

  function buildHealthRow(label, desc) {
    const row = document.createElement("div");
    row.className = "row";
    const text = document.createElement("div");
    text.className = "row-text";
    const labelNode = document.createElement("span");
    labelNode.className = "row-label";
    labelNode.textContent = label;
    const descNode = document.createElement("span");
    descNode.className = "row-desc";
    descNode.textContent = desc;
    text.appendChild(labelNode);
    text.appendChild(descNode);
    row.appendChild(text);
    return row;
  }

  function describeState(stateId) {
    const keyMap = {
      working: "sessionWorking",
      thinking: "sessionThinking",
      juggling: "sessionJuggling",
      sweeping: "sessionSweeping",
      notification: "sessionNotification",
      worktree: "sessionWorktree",
      idle: "sessionIdle",
      sleeping: "sessionSleeping",
    };
    return keyMap[stateId] ? t(keyMap[stateId]) : humanizeId(stateId);
  }

  function humanizeId(value) {
    return String(value || t("statsUnknownLabel"))
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  function formatLastActive(value) {
    if (!Number.isFinite(value) || value <= 0) return t("statsNever");
    try {
      return new Date(value).toLocaleString();
    } catch {
      return t("statsNever");
    }
  }

  function init(core) {
    state = core.state;
    runtime = core.runtime;
    helpers = core.helpers;
    ops = core.ops;
    core.tabs.stats = { render };
  }

  root.DeskBuddySettingsTabStats = { init };
})(globalThis);
