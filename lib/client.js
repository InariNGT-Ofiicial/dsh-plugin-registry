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
.dpr-root { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 980px; }

.dpr-toolbar { display: flex; gap: 8px; align-items: center; }
.dpr-input {
  flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.dpr-input:focus {
  outline: none;
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent);
}
.dpr-search-btn {
  padding: 8px 18px; border-radius: 8px; border: none; font-size: 13px; white-space: nowrap;
  background: var(--dsw-alias-state-business-primary); color: #fff; cursor: pointer;
  transition: opacity .15s ease;
}
.dpr-search-btn:hover:not(:disabled) { opacity: .88; }
.dpr-search-btn:disabled { opacity: .55; cursor: default; }

.dpr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dpr-chip {
  padding: 3px 11px; border-radius: 999px; font-size: 12px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l2);
  background: transparent; color: var(--dsw-alias-label-secondary);
  transition: all .15s ease;
}
.dpr-chip:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-label-tertiary); }
.dpr-chip.active {
  background: var(--dsw-alias-state-business-primary);
  border-color: transparent; color: #fff;
}

.dpr-banner { border-radius: 8px; padding: 8px 12px; font-size: 13px; border: 1px solid; }
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

.dpr-meta { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.dpr-empty {
  padding: 32px 0; text-align: center; font-size: 13px;
  color: var(--dsw-alias-label-tertiary);
}

.dpr-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;
}
.dpr-card {
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px; border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-3);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.dpr-card:hover {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent);
  box-shadow: 0 2px 10px rgba(0, 0, 0, .08);
}
.dpr-card-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.dpr-card-name { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dpr-badge {
  flex-shrink: 0; padding: 1px 8px; border-radius: 999px; font-size: 11px;
  color: var(--dsw-alias-state-business-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent);
}
.dpr-card-desc {
  font-size: 13px; color: var(--dsw-alias-label-secondary); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.4em;
}
.dpr-card-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 6px; }
.dpr-card-link {
  font-size: 12px; color: var(--dsw-alias-label-tertiary); text-decoration: none;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dpr-card-link:hover { color: var(--dsw-alias-state-business-primary); text-decoration: underline; }
.dpr-install-btn {
  flex-shrink: 0; padding: 4px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;
  border: 1px solid var(--dsw-alias-state-business-primary);
  background: transparent; color: var(--dsw-alias-state-business-primary);
  transition: all .15s ease;
}
.dpr-install-btn:hover:not(:disabled) { background: var(--dsw-alias-state-business-primary); color: #fff; }
.dpr-install-btn:disabled { opacity: .55; cursor: default; }
`;
function describe(p) {
  return p.description?.zh ?? p.description?.en ?? "";
}
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
function Market({ search, install }) {
  const [query, setQuery] = (0, import_react.useState)("");
  const [category, setCategory] = (0, import_react.useState)("");
  const [items, setItems] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [installing, setInstalling] = (0, import_react.useState)(null);
  const [notice, setNotice] = (0, import_react.useState)(null);
  const runSearch = async (q = query, c = category) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setItems(await search(q, c || void 0, 500));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
    void runSearch();
  }, []);
  const onPickCategory = (value) => {
    setCategory(value);
    void runSearch(query, value);
  };
  const onInstall = async (p) => {
    if (!window.confirm(`\u5373\u5C06\u5B89\u88C5\u7B2C\u4E09\u65B9\u63D2\u4EF6\u300C${p.name}\u300D\uFF08${p.url}\uFF09\u3002
\u63D2\u4EF6\u4E3A\u7B2C\u4E09\u65B9\u4EE3\u7801\uFF0C\u786E\u5B9A\u7EE7\u7EED\uFF1F`)) return;
    setInstalling(p.name);
    setError(null);
    setNotice(null);
    try {
      const result = await install(p.name);
      setNotice(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setInstalling(null);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: STYLES }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "search",
          className: "dpr-input",
          value: query,
          placeholder: "\u641C\u7D22\u63D2\u4EF6\uFF0C\u5982\u300C\u5FAE\u4FE1\u901A\u77E5\u300D\u300CTUI\u300D",
          onChange: (e) => setQuery(e.currentTarget.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") void runSearch();
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dpr-search-btn", onClick: () => void runSearch(), disabled: busy, children: busy ? "\u641C\u7D22\u4E2D\u2026" : "\u641C\u7D22" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-chips", children: CATEGORIES.map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: `dpr-chip${category === value ? " active" : ""}`,
        onClick: () => onPickCategory(value),
        children: label
      },
      value
    )) }),
    error != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-banner error", role: "alert", children: error }) : null,
    notice != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-banner notice", role: "status", children: notice }) : null,
    busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-meta", children: "\u6B63\u5728\u68C0\u7D22\u2026" }) : null,
    !busy && items != null && items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-empty", children: "\u6CA1\u6709\u5339\u914D\u7684\u63D2\u4EF6\u3002\u6362\u66F4\u5BBD\u6CDB\u7684\u5173\u952E\u8BCD\uFF0C\u6216\u6D4F\u89C8 awesome-dsh-plugin.com" }) : null,
    !busy && items != null && items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-meta", children: [
        "\u5171 ",
        items.length,
        " \u4E2A\u63D2\u4EF6"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dpr-grid", children: items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "dpr-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-card-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-card-name", title: p.name, children: p.name }),
          p.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dpr-badge", children: CATEGORY_LABEL[p.category] ?? p.category }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dpr-card-desc", children: describe(p) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dpr-card-foot", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", { className: "dpr-card-link", href: p.url, target: "_blank", rel: "noreferrer", title: p.url, children: [
            p.owner,
            "/",
            p.name
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "dpr-install-btn",
              onClick: () => void onInstall(p),
              disabled: installing === p.name,
              children: installing === p.name ? "\u5B89\u88C5\u4E2D\u2026" : "\u5B89\u88C5"
            }
          )
        ] })
      ] }, p.name)) })
    ] }) : null
  ] });
}
function apply(ctx) {
  const slots = ctx.slots;
  const search = (q, category, limit = 20) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (category) params.set("category", category);
    return api(`/api/dsh-plugin-registry/search?${params.toString()}`).then((d) => d.plugins);
  };
  const install = (ref) => api("/api/dsh-plugin-registry/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ref })
  }).then((d) => d.result);
  slots.inject(
    "settings.section",
    () => slots.register(
      {
        name: "settings.section",
        id: "dsh-plugin-registry",
        order: 100,
        label: "\u63D2\u4EF6\u5E02\u573A",
        inject: () => ({ search, install })
      },
      Market
    )
  );
}

    return module.exports;
  },
});

