"use strict";

(function initSettingsTabPlugins(root) {
  let state = null;
  let helpers = null;
  let ops = null;

  const view = {
    snapshot: null,
    loading: false,
    error: "",
    filter: "all",
    expandedPluginId: null,
    seq: 0,
    fetchedAt: 0,
  };

  const REFRESH_STALE_MS = 10_000;

  function t(key) {
    return helpers.t(key);
  }

  function shouldRefresh() {
    if (!view.snapshot) return true;
    return (Date.now() - view.fetchedAt) > REFRESH_STALE_MS;
  }

  function fetchPlugins({ forceRender = false } = {}) {
    if (view.loading) return;
    if (!window.settingsAPI || typeof window.settingsAPI.getPluginSnapshot !== "function") {
      view.error = "settings API unavailable";
      return;
    }
    view.loading = true;
    const seq = ++view.seq;
    window.settingsAPI.getPluginSnapshot().then((snapshot) => {
      if (seq !== view.seq) return;
      view.loading = false;
      view.error = "";
      view.snapshot = snapshot || { plugins: [] };
      view.fetchedAt = Date.now();
      if (forceRender && state.activeTab === "plugins") ops.requestRender({ content: true });
    }).catch((err) => {
      if (seq !== view.seq) return;
      view.loading = false;
      view.error = err && err.message ? err.message : "plugins unavailable";
      if (forceRender && state.activeTab === "plugins") ops.requestRender({ content: true });
    });
  }

  function filterPlugins(plugins) {
    const list = Array.isArray(plugins) ? plugins.slice() : [];
    switch (view.filter) {
      case "enabled": return list.filter((plugin) => plugin.enabled);
      case "disabled": return list.filter((plugin) => !plugin.enabled);
      case "menu": return list.filter((plugin) => plugin.featuredInMenu !== false);
      default: return list;
    }
  }

  function render(parent) {
    if (!view.loading && shouldRefresh()) fetchPlugins({ forceRender: true });

    const h1 = document.createElement("h1");
    h1.textContent = t("pluginsTitle");
    parent.appendChild(h1);

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent = t("pluginsSubtitle");
    parent.appendChild(subtitle);

    if (view.error && !view.snapshot) {
      parent.appendChild(buildMessageSection(t("pluginsLoadFailed"), view.error));
      return;
    }
    if (!view.snapshot) {
      parent.appendChild(buildMessageSection(t("pluginsLoadingTitle"), t("pluginsLoadingBody")));
      return;
    }

    const plugins = filterPlugins(view.snapshot.plugins);
    if (!plugins.length) {
      parent.appendChild(buildFilterBar());
      parent.appendChild(buildMessageSection(t("pluginsEmptyTitle"), t("pluginsEmptyBody")));
      return;
    }

    parent.appendChild(buildFilterBar());
    parent.appendChild(buildPluginGrid(plugins));
    parent.appendChild(buildFooter(plugins.length));
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

  function buildFilterBar() {
    const wrap = document.createElement("div");
    wrap.className = "plugin-filter-bar";
    const filters = [
      ["all", t("pluginsFilterAll")],
      ["enabled", t("pluginsFilterEnabled")],
      ["disabled", t("pluginsFilterDisabled")],
      ["menu", t("pluginsFilterMenu")],
    ];
    for (const [id, label] of filters) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `plugin-filter-chip${view.filter === id ? " active" : ""}`;
      button.textContent = label;
      button.addEventListener("click", () => {
        view.filter = id;
        ops.requestRender({ content: true });
      });
      wrap.appendChild(button);
    }
    return wrap;
  }

  function buildPluginGrid(plugins) {
    const grid = document.createElement("div");
    grid.className = "plugin-card-grid";
    for (const plugin of plugins) {
      grid.appendChild(buildPluginCard(plugin));
    }
    return grid;
  }

  function buildPluginCard(plugin) {
    const card = document.createElement("article");
    card.className = "plugin-card";

    const header = document.createElement("div");
    header.className = "plugin-card-head";
    const text = document.createElement("div");
    text.className = "plugin-card-text";
    const title = document.createElement("div");
    title.className = "plugin-card-title";
    title.textContent = t(plugin.nameKey);
    const desc = document.createElement("div");
    desc.className = "plugin-card-desc";
    desc.textContent = t(plugin.descriptionKey);
    text.appendChild(title);
    text.appendChild(desc);
    header.appendChild(text);
    header.appendChild(buildPluginToggle(plugin));
    card.appendChild(header);

    const badges = document.createElement("div");
    badges.className = "plugin-card-badges";
    badges.appendChild(buildBadge(plugin.enabled ? "active" : "disabled", plugin.enabled ? t("pluginsStatusActive") : t("pluginsStatusDisabled")));
    if (plugin.bundled) badges.appendChild(buildBadge("bundled", t("pluginsStatusBundled")));
    if (plugin.featuredInMenu !== false) badges.appendChild(buildBadge("menu", t("pluginsStatusMenu")));
    card.appendChild(badges);

    const controls = document.createElement("div");
    controls.className = "plugin-card-controls";
    const configure = document.createElement("button");
    configure.type = "button";
    configure.className = "soft-btn";
    configure.textContent = view.expandedPluginId === plugin.id ? t("pluginsActionHide") : t("pluginsActionConfigure");
    configure.addEventListener("click", () => {
      view.expandedPluginId = view.expandedPluginId === plugin.id ? null : plugin.id;
      ops.requestRender({ content: true });
    });
    controls.appendChild(configure);

    const commandCount = document.createElement("div");
    commandCount.className = "plugin-card-command-count";
    commandCount.textContent = `${plugin.commandCount || 0} ${t("pluginsCommandsLabel").toLowerCase()}`;
    controls.appendChild(commandCount);
    card.appendChild(controls);

    if (view.expandedPluginId === plugin.id) {
      card.appendChild(buildCommandPanel(plugin));
    }

    return card;
  }

  function buildPluginToggle(plugin) {
    const wrap = document.createElement("label");
    wrap.className = "plugin-card-toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = plugin.enabled === true;
    input.addEventListener("change", () => {
      window.settingsAPI.command("setPetPluginEnabled", {
        pluginId: plugin.id,
        value: input.checked === true,
      }).then((result) => {
        if (!result || result.status !== "ok") {
          helpers.showToast(`${t("toastSaveFailed")}${(result && result.message) || "unknown error"}`, { error: true });
          input.checked = !input.checked;
          return;
        }
        fetchPlugins({ forceRender: true });
      }).catch((err) => {
        helpers.showToast(`${t("toastSaveFailed")}${(err && err.message) || String(err)}`, { error: true });
        input.checked = !input.checked;
      });
    });
    wrap.appendChild(input);
    return wrap;
  }

  function buildBadge(kind, text) {
    const badge = document.createElement("span");
    badge.className = `plugin-badge ${kind}`;
    badge.textContent = text;
    return badge;
  }

  function buildCommandPanel(plugin) {
    const panel = document.createElement("div");
    panel.className = "plugin-command-panel";
    const commands = Array.isArray(plugin.commands) ? plugin.commands : [];
    if (!commands.length) return panel;
    for (const command of commands) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "soft-btn plugin-command-btn";
      button.disabled = command.enabled === false || plugin.enabled === false;
      const label = t(command.titleKey);
      button.textContent = command.type === "checkbox"
        ? `${label}: ${command.checked ? "On" : "Off"}`
        : label;
      button.addEventListener("click", () => {
        window.settingsAPI.runPetPluginCommand(plugin.id, command.id).then((result) => {
          if (!result || result.status !== "ok") {
            helpers.showToast(`${t("toastSaveFailed")}${(result && result.message) || "unknown error"}`, { error: true });
            return;
          }
          fetchPlugins({ forceRender: true });
        }).catch((err) => {
          helpers.showToast(`${t("toastSaveFailed")}${(err && err.message) || String(err)}`, { error: true });
        });
      });
      panel.appendChild(button);
    }
    return panel;
  }

  function buildFooter(count) {
    const footer = document.createElement("div");
    footer.className = "plugin-footer-count";
    footer.textContent = t("pluginsFooterCount").replace("{count}", String(count));
    return footer;
  }

  function init(core) {
    state = core.state;
    helpers = core.helpers;
    ops = core.ops;
    core.tabs.plugins = { render };
  }

  root.DeskBuddySettingsTabPlugins = { init };
})(globalThis);
