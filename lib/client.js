window.__ModuleLoader__.load({
  id: "dsh-plugin-registry",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var name = "dsh-plugin-registry";
var inject = ["slots"];
var CATEGORIES = [
  ["", "\u5168\u90E8"],
  ["ui", "UI \u589E\u5F3A"],
  ["theme", "\u4E3B\u9898\u5916\u89C2"],
  ["session", "\u4F1A\u8BDD\u6D88\u606F"],
  ["memory", "\u8BB0\u5FC6"],
  ["tools", "\u5DE5\u5177\u80FD\u529B"],
  ["skill", "\u6280\u80FD\u5305"],
  ["workflow", "\u5DE5\u4F5C\u6D41"],
  ["notify", "\u901A\u77E5\u96C6\u6210"],
  ["model", "\u6A21\u578B\u8D26\u53F7"],
  ["dev", "\u5F00\u53D1\u8FD0\u884C\u65F6"],
  ["fun", "\u5A31\u4E50"]
];
var CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(([v, l]) => [v, l]));
var STYLES = `
.dpr-root { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 980px; }

.dpr-toolbar { display: flex; gap: 8px; align-items: center; }
.dpr-input-wrap { position: relative; flex: 1; display: flex; align-items: center; }
.dpr-input {
  width: 100%; padding: 9px 34px 9px 12px; border-radius: 8px; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.dpr-input::-webkit-search-cancel-button { display: none; }
.dpr-input:focus {
  outline: none;
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent);
}
.dpr-clear-btn {
  position: absolute; right: 6px; width: 22px; height: 22px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 50%; cursor: pointer;
  background: transparent; color: var(--dsw-alias-label-tertiary);
  font-size: 15px; line-height: 1;
  transition: background .15s ease, color .15s ease;
}
.dpr-clear-btn:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 18%, transparent);
  color: var(--dsw-alias-label-primary);
}
.dpr-search-btn {
  padding: 9px 18px; border-radius: 8px; border: none; font-size: 13px; white-space: nowrap;
  background: var(--dsw-alias-state-business-primary); color: #fff; cursor: pointer;
  transition: opacity .15s ease, box-shadow .15s ease;
}
.dpr-search-btn:hover:not(:disabled) { opacity: .88; box-shadow: 0 2px 8px color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent); }
.dpr-search-btn:disabled { opacity: .55; cursor: default; }
.dpr-sort { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.dpr-sort-label {
  flex-shrink: 0; font-size: 12px; line-height: 22px;
  color: var(--dsw-alias-label-tertiary); user-select: none;
}
.dpr-sort-wrap { position: relative; display: inline-flex; }
.dpr-sort-select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding: 9px 30px 9px 12px; border-radius: 8px; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.dpr-sort-select:hover { border-color: var(--dsw-alias-label-tertiary); color: var(--dsw-alias-label-primary); }
.dpr-sort-select:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 18%, transparent);
}
.dpr-sort-wrap::after {
  content: ''; position: absolute; top: 50%; right: 11px;
  width: 6px; height: 6px; margin-top: -4px;
  border-right: 1.5px solid var(--dsw-alias-label-tertiary);
  border-bottom: 1.5px solid var(--dsw-alias-label-tertiary);
  transform: rotate(45deg);
  pointer-events: none;
}

.dpr-filter-row { display: flex; gap: 10px; align-items: flex-start; }
.dpr-filter-label {
  flex-shrink: 0; padding: 3px 0; font-size: 12px; line-height: 22px;
  color: var(--dsw-alias-label-tertiary); user-select: none;
}
.dpr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dpr-chip {
  padding: 3px 12px; border-radius: 999px; font-size: 12px; line-height: 20px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l2);
  background: transparent; color: var(--dsw-alias-label-secondary);
  transition: all .15s ease;
}
.dpr-chip:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-label-tertiary); transform: translateY(-1px); }
.dpr-chip.active {
  background: var(--dsw-alias-state-business-primary);
  border-color: transparent; color: #fff;
  box-shadow: 0 1px 5px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);
}
.dpr-chip-count { margin-left: 4px; opacity: .65; font-size: 11px; }

.dpr-banner {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  border-radius: 8px; padding: 8px 12px; font-size: 13px; border: 1px solid;
  animation: dpr-fade .15s ease;
}
.dpr-banner.error {
  color: var(--dsw-alias-state-error-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}
.dpr-banner.notice {
  color: var(--dsw-alias-state-success-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent);
}
.dpr-banner-close {
  flex-shrink: 0; padding: 1px 4px; border: none; border-radius: 4px; cursor: pointer;
  background: transparent; color: inherit; font-size: 14px; line-height: 1.2; opacity: .65;
  transition: opacity .15s ease;
}
.dpr-banner-close:hover { opacity: 1; }

.dpr-progress {
  height: 2px; border-radius: 2px; overflow: hidden;
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);
}
.dpr-progress-bar {
  height: 100%; width: 35%; border-radius: 2px;
  background: var(--dsw-alias-state-business-primary);
  animation: dpr-slide 1s ease-in-out infinite;
}

.dpr-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dpr-empty {
  padding: 40px 0; text-align: center; font-size: 13px; line-height: 1.8;
  color: var(--dsw-alias-label-tertiary);
}

.dpr-results { display: flex; flex-direction: column; gap: 10px; transition: opacity .15s ease; }
.dpr-results.busy { opacity: .5; pointer-events: none; }

.dpr-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;
}
.dpr-card {
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px; border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-3);
  transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.dpr-card:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);
  box-shadow: 0 4px 14px rgba(0, 0, 0, .1);
  transform: translateY(-2px);
}
.dpr-card-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.dpr-card-name { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dpr-card-tags { display: flex; gap: 4px; flex-shrink: 0; }
.dpr-badge {
  flex-shrink: 0; padding: 1px 8px; border-radius: 999px; font-size: 11px;
  color: var(--dsw-alias-state-business-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);
}
.dpr-badge.installed {
  color: var(--dsw-alias-state-success-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, transparent);
}
.dpr-card-desc {
  font-size: 13px; color: var(--dsw-alias-label-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.4em;
}
.dpr-card-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 6px; }
.dpr-card-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dpr-card-stat { font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.dpr-card-link {
  font-size: 12px; color: var(--dsw-alias-label-tertiary); text-decoration: none;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color .15s ease;
}
.dpr-card-link:hover { color: var(--dsw-alias-state-business-primary); text-decoration: underline; }
.dpr-install-btn {
  flex-shrink: 0; padding: 4px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;
  border: 1px solid transparent;
  background: var(--dsw-alias-state-business-primary); color: #fff;
  transition: opacity .15s ease, box-shadow .15s ease;
}
.dpr-install-btn:hover:not(:disabled) { opacity: .88; box-shadow: 0 2px 8px color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent); }
.dpr-install-btn:disabled { opacity: .55; cursor: default; }
.dpr-uninstall-btn {
  flex-shrink: 0; padding: 4px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;
  border: 1px solid var(--dsw-alias-state-error-primary);
  background: transparent; color: var(--dsw-alias-state-error-primary);
  transition: all .15s ease;
}
.dpr-uninstall-btn:hover:not(:disabled) { background: var(--dsw-alias-state-error-primary); color: #fff; }
.dpr-uninstall-btn:disabled { opacity: .55; cursor: default; }

.dpr-skel-card {
  height: 118px; border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: linear-gradient(
    100deg,
    var(--dsw-alias-bg-layer-3) 40%,
    color-mix(in srgb, var(--dsw-alias-bg-layer-3) 70%, var(--dsw-alias-label-tertiary) 12%) 50%,
    var(--dsw-alias-bg-layer-3) 60%
  );
  background-size: 200% 100%;
  animation: dpr-shimmer 1.2s linear infinite;
}

.dpr-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 24px; background: rgba(0, 0, 0, .45);
  backdrop-filter: blur(2px);
  animation: dpr-fade .15s ease;
}
.dpr-modal {
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px; border-radius: 14px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, .25);
  animation: dpr-pop .18s ease;
}
.dpr-modal-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dpr-modal-body { display: flex; flex-direction: column; gap: 6px; }
.dpr-modal-name {
  font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary);
  word-break: break-all;
}
.dpr-modal-link {
  font-size: 12px; color: var(--dsw-alias-label-tertiary); text-decoration: none;
  word-break: break-all;
}
.dpr-modal-link:hover { color: var(--dsw-alias-state-business-primary); text-decoration: underline; }
.dpr-modal-warn {
  margin-top: 6px; font-size: 13px; line-height: 1.5;
  color: var(--dsw-alias-label-secondary);
  border-left: 3px solid var(--dsw-alias-state-warning-primary, var(--dsw-alias-state-business-primary));
  padding-left: 10px;
}
.dpr-modal-foot { display: flex; justify-content: flex-end; gap: 8px; }
.dpr-modal-btn {
  padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l2);
  background: transparent; color: var(--dsw-alias-label-primary);
  transition: all .15s ease;
}
.dpr-modal-btn:hover:not(:disabled) { border-color: var(--dsw-alias-label-tertiary); }
.dpr-modal-btn.confirm {
  background: var(--dsw-alias-state-business-primary);
  border-color: transparent; color: #fff;
}
.dpr-modal-btn.confirm:hover:not(:disabled) { opacity: .88; }
.dpr-modal-btn.danger {
  background: var(--dsw-alias-state-error-primary);
  border-color: transparent; color: #fff;
}
.dpr-modal-btn.danger:hover:not(:disabled) { opacity: .88; }
.dpr-modal-btn:disabled { opacity: .55; cursor: default; }

.dpr-chip:focus-visible,
.dpr-search-btn:focus-visible,
.dpr-install-btn:focus-visible,
.dpr-uninstall-btn:focus-visible,
.dpr-clear-btn:focus-visible,
.dpr-modal-btn:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}

@keyframes dpr-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes dpr-pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes dpr-slide { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
@keyframes dpr-shimmer { from { background-position: 120% 0; } to { background-position: -80% 0; } }
`;
function api(path, init) {
  return fetch(path, init).then(async (res) => {
    let data = {};
    try {
      data = await res.json();
    } catch {
    }
    if (!data.ok) throw new Error(data.error ?? `\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${res.status}\uFF09`);
    return data;
  });
}
function Market({ search, install, uninstall }) {
  const [query, setQuery] = (0, import_react.useState)("");
  const [category, setCategory] = (0, import_react.useState)("");
  const [sort, setSort] = (0, import_react.useState)("stars");
  const [items, setItems] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [notice, setNotice] = (0, import_react.useState)(null);
  const [installing, setInstalling] = (0, import_react.useState)(null);
  const [installFilter, setInstallFilter] = (0, import_react.useState)(null);
  const [confirm, setConfirm] = (0, import_react.useState)(null);
  const searchSeq = (0, import_react.useRef)(0);
  const skipInitialDebounce = (0, import_react.useRef)(true);
  const runSearch = async (q = query, c = category, s = sort) => {
    const seq = ++searchSeq.current;
    setBusy(true);
    setError(null);
    try {
      const result = await search(q, c || void 0, 500, s);
      if (seq !== searchSeq.current) return;
      setItems(result);
    } catch (e) {
      if (seq !== searchSeq.current) return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (seq === searchSeq.current) setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
    void runSearch();
  }, []);
  (0, import_react.useEffect)(() => {
    if (skipInitialDebounce.current) {
      skipInitialDebounce.current = false;
      return;
    }
    const timer = setTimeout(() => void runSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const onPickCategory = (value) => {
    if (value === category) return;
    setCategory(value);
    void runSearch(query, value);
  };
  const onPickSort = (value) => {
    if (value === sort) return;
    setSort(value);
    void runSearch(query, category, value);
  };
  const installedByUrl = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of items ?? []) if (p.installed) map.set(p.url, p);
    return map;
  }, [items]);
  const isInstalled = (p) => installedByUrl.has(p.url);
  const filterCounts = (0, import_react.useMemo)(() => {
    let installedCount = 0;
    if (items != null) {
      for (const p of items) if (isInstalled(p)) installedCount++;
    }
    return { installed: installedCount, uninstalled: (items?.length ?? 0) - installedCount };
  }, [items, installedByUrl]);
  const visibleItems = items == null ? null : items.filter((p) => {
    if (installFilter === "installed") return isInstalled(p);
    if (installFilter === "uninstalled") return !isInstalled(p);
    return true;
  });
  const doInstall = async (p) => {
    setInstalling(p.url);
    setError(null);
    setNotice(null);
    try {
      const result = await install(p.url);
      setNotice(result.message);
      if (result.ok) void runSearch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setInstalling(null);
    }
  };
  const doUninstall = async (p) => {
    setInstalling(p.url);
    setError(null);
    setNotice(null);
    try {
      const result = await uninstall(p.url);
      setNotice(result.message);
      if (result.ok) void runSearch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setInstalling(null);
    }
  };
  const onInstall = (p) => setConfirm({ plugin: p, action: "install" });
  const onUninstall = (p) => setConfirm({ plugin: p, action: "uninstall" });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: STYLES }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-input-wrap", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "search",
            className: "dpr-input",
            value: query,
            placeholder: "\u641C\u7D22\u63D2\u4EF6\uFF0C\u5982\u300C\u5FAE\u4FE1\u901A\u77E5\u300D\u300CTUI\u300D",
            onChange: (e) => setQuery(e.currentTarget.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) void runSearch();
            }
          }
        ),
        query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-clear-btn", "aria-label": "\u6E05\u7A7A\u641C\u7D22", onClick: () => setQuery(""), children: "\xD7" }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dpr-sort", title: "\u6392\u5E8F", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-sort-label", children: "\u6392\u5E8F" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-sort-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "select",
          {
            className: "dpr-sort-select",
            "aria-label": "\u6392\u5E8F",
            value: sort,
            onChange: (e) => onPickSort(e.currentTarget.value),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "relevance", children: "\u76F8\u5173\u5EA6" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "stars", children: "\u6309 Star" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "recent", children: "\u6309\u6700\u65B0" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-search-btn", onClick: () => void runSearch(), disabled: busy, children: busy ? "\u641C\u7D22\u4E2D\u2026" : "\u641C\u7D22" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-filter-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-filter-label", children: "\u5206\u7C7B" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-chips", children: CATEGORIES.map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: `dpr-chip${category === value ? " active" : ""}`,
          onClick: () => onPickCategory(value),
          children: label
        },
        value
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-filter-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-filter-label", children: "\u72B6\u6001" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-chips", children: ["installed", "uninstalled"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: `dpr-chip${installFilter === value ? " active" : ""}`,
          onClick: () => setInstallFilter((prev) => prev === value ? null : value),
          children: [
            value === "installed" ? "\u5DF2\u5B89\u88C5" : "\u672A\u5B89\u88C5",
            items != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-chip-count", children: value === "installed" ? filterCounts.installed : filterCounts.uninstalled }) : null
          ]
        },
        value
      )) })
    ] }),
    error != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-banner error", role: "alert", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-banner-close", "aria-label": "\u5173\u95ED", onClick: () => setError(null), children: "\xD7" })
    ] }) : null,
    notice != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-banner notice", role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-banner-close", "aria-label": "\u5173\u95ED", onClick: () => setNotice(null), children: "\xD7" })
    ] }) : null,
    busy && items != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-progress", role: "progressbar", "aria-label": "\u6B63\u5728\u68C0\u7D22", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-progress-bar" }) }) : null,
    items == null && busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dpr-grid", "aria-hidden": "true", children: Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "dpr-skel-card" }, i)) }) : null,
    !busy && items != null && items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-empty", children: [
      "\u6CA1\u6709\u5339\u914D\u7684\u63D2\u4EF6\u3002",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
      "\u6362\u66F4\u5BBD\u6CDB\u7684\u5173\u952E\u8BCD\uFF0C\u6216\u6D4F\u89C8 awesome-dsh-plugin.com"
    ] }) : null,
    !busy && items != null && items.length > 0 && visibleItems != null && visibleItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-empty", children: "\u6CA1\u6709\u7B26\u5408\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684\u63D2\u4EF6\u3002" }) : null,
    visibleItems != null && visibleItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dpr-results${busy ? " busy" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-meta", children: [
        "\u5171 ",
        visibleItems.length,
        " \u4E2A\u63D2\u4EF6",
        installFilter != null ? `\uFF08\u4EC5\u663E\u793A${installFilter === "installed" ? "\u5DF2\u5B89\u88C5" : "\u672A\u5B89\u88C5"}\uFF09` : ""
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dpr-grid", children: visibleItems.map((p) => {
        const pInstalled = isInstalled(p);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "dpr-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-card-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-card-name", title: p.name, children: p.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dpr-card-tags", children: [
              pInstalled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-badge installed", children: "\u5DF2\u5B89\u88C5" }) : null,
              p.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-badge", children: CATEGORY_LABEL[p.category] ?? p.category }) : null
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-card-desc", children: p.description }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-card-foot", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-card-meta", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", { className: "dpr-card-link", href: p.url, target: "_blank", rel: "noreferrer", title: p.url, children: [
                p.owner,
                "/",
                p.name
              ] }),
              p.stars != null || p.createdAt != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dpr-card-stat", children: [
                p.stars != null ? `\u2605 ${p.stars.toLocaleString()}` : "",
                p.stars != null && p.createdAt != null ? " \xB7 " : "",
                p.createdAt != null ? p.createdAt.replace(/-/g, ".") : ""
              ] }) : null
            ] }),
            pInstalled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dpr-uninstall-btn",
                onClick: () => onUninstall(p),
                disabled: installing === p.url,
                children: installing === p.url ? "\u5378\u8F7D\u4E2D\u2026" : "\u5378\u8F7D"
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dpr-install-btn",
                onClick: () => onInstall(p),
                disabled: installing === p.url,
                children: installing === p.url ? "\u5B89\u88C5\u4E2D\u2026" : "\u5B89\u88C5"
              }
            )
          ] })
        ] }, p.url);
      }) })
    ] }) : null,
    confirm != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ConfirmModal,
      {
        plugin: confirm.plugin,
        action: confirm.action,
        busy: installing != null,
        onCancel: () => setConfirm(null),
        onConfirm: () => {
          const { plugin, action } = confirm;
          setConfirm(null);
          if (action === "install") void doInstall(plugin);
          else void doUninstall(plugin);
        }
      }
    ) : null
  ] });
}
function ConfirmModal({ plugin, action, busy, onCancel, onConfirm }) {
  (0, import_react.useEffect)(() => {
    if (busy) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel, onConfirm]);
  const installing = action === "install";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "dpr-modal-overlay",
      onClick: () => {
        if (!busy) onCancel();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "dpr-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": installing ? "\u786E\u8BA4\u5B89\u88C5" : "\u786E\u8BA4\u5378\u8F7D",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-modal-title", children: installing ? "\u786E\u8BA4\u5B89\u88C5" : "\u786E\u8BA4\u5378\u8F7D" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-modal-body", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-modal-name", children: plugin.name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "dpr-modal-link", href: plugin.url, target: "_blank", rel: "noreferrer", title: plugin.url, children: plugin.url }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-modal-warn", children: installing ? "\u8BE5\u63D2\u4EF6\u4E3A\u7B2C\u4E09\u65B9\u4EE3\u7801\uFF0C\u5B89\u88C5\u524D\u8BF7\u786E\u8BA4\u5DF2\u5BA1\u9605\u5176\u6E90\u7801\u3002" : "\u5C06\u79FB\u9664\u8BE5\u63D2\u4EF6\u7684\u4F9D\u8D56\u4E0E\u63D2\u4EF6\u5C42\uFF08bundle\uFF09\u6761\u76EE\uFF0CHMR \u70ED\u52A0\u8F7D\u751F\u6548\u3002" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-modal-foot", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-modal-btn cancel", onClick: onCancel, disabled: busy, children: "\u53D6\u6D88" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: `dpr-modal-btn ${installing ? "confirm" : "danger"}`,
                  onClick: onConfirm,
                  disabled: busy,
                  children: busy ? "\u5904\u7406\u4E2D\u2026" : installing ? "\u786E\u8BA4\u5B89\u88C5" : "\u786E\u8BA4\u5378\u8F7D"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function apply(ctx) {
  const slots = ctx.slots;
  const search = (q, category, limit = 20, sort = "stars") => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (category) params.set("category", category);
    if (sort !== "relevance") params.set("sort", sort);
    return api(`/api/dsh-plugin-registry/search?${params.toString()}`).then((d) => d.plugins);
  };
  const install = (ref) => api("/api/dsh-plugin-registry/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ref })
  }).then((d) => d.result);
  const uninstall = (ref) => api("/api/dsh-plugin-registry/uninstall", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ref })
  }).then((d) => d.result);
  slots.inject(
    "settings.plugins.tab",
    () => slots.register(
      {
        name: "settings.plugins.tab",
        id: "market",
        order: 20,
        label: "\u63D2\u4EF6\u5E02\u573A",
        inject: () => ({ search, install, uninstall })
      },
      Market
    )
  );
}

    return module.exports;
  },
});

