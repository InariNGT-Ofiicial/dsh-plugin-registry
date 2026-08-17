import type { Context } from '@deepseek-ai/cordis'
import { useEffect, useMemo, useRef, useState } from 'react'

export const name = 'dsh-plugin-registry'
export const inject = ['slots']

/** 与 src/types.ts 的 SearchHit 对应：url 是唯一身份。 */
interface PluginHit {
  url: string
  name: string
  owner: string
  category: string
  description: string
  install: string
  npm: string | null
  stars: number | null
  createdAt: string | null
  installed: boolean
  packageName: string | null
}

// 排序模式：相关度（默认）/ 按 Star / 按最新，与 src/registry.ts 的 SortMode 对应。
type SortMode = 'relevance' | 'stars' | 'recent'

interface InstallResult {
  ok: boolean
  alreadyInstalled: boolean
  url: string
  name: string
  packageName: string
  bundled: boolean
  profileDir: string
  message: string
}

interface UninstallResult {
  ok: boolean
  url: string
  name: string
  packageName: string
  profileDir: string
  message: string
}

// 分类列表：[值, 中文标签]，与 registry 的 categories 键对应。
const CATEGORIES = [
  ['', '全部'],
  ['ui', 'UI 增强'],
  ['theme', '主题外观'],
  ['session', '会话消息'],
  ['memory', '记忆'],
  ['tools', '工具能力'],
  ['skill', '技能包'],
  ['workflow', '工作流'],
  ['notify', '通知集成'],
  ['model', '模型账号'],
  ['dev', '开发运行时'],
  ['fun', '娱乐'],
] as const

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(([v, l]) => [v, l]))

const STYLES = `
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
`

// 封装对宿主 HTTP 接口的调用：统一 JSON 解析与错误抛出（ok 为 false 时抛错）。
function api(path: string, init?: RequestInit): Promise<any> {
  return fetch(path, init).then(async (res) => {
    let data: any = {}
    try {
      data = await res.json()
    } catch {
      /* non-JSON body */
    }
    if (!data.ok) throw new Error(data.error ?? `请求失败（HTTP ${res.status}）`)
    return data
  })
}

interface MarketProps {
  search: (query: string, category?: string, limit?: number, sort?: SortMode) => Promise<PluginHit[]>
  install: (ref: string) => Promise<InstallResult>
  uninstall: (ref: string) => Promise<UninstallResult>
}

function Market({ search, install, uninstall }: MarketProps) {
  // 组件状态：查询词、分类、排序、结果列表、加载/错误/通知、安装中的插件、状态筛选、确认弹窗。
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<SortMode>('stars')
  const [items, setItems] = useState<PluginHit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [installing, setInstalling] = useState<string | null>(null)
  const [installFilter, setInstallFilter] = useState<'installed' | 'uninstalled' | null>(null)
  const [confirm, setConfirm] = useState<{ plugin: PluginHit; action: 'install' | 'uninstall' } | null>(null)
  // 请求序号：并发搜索时只采纳最后一次结果，避免列表与筛选条件错位
  const searchSeq = useRef(0)
  // 首次渲染跳过防抖，直接立即搜索一次。
  const skipInitialDebounce = useRef(true)

  // 执行搜索：递增请求序号，完成后仅当仍是最新一次才更新状态。
  const runSearch = async (q = query, c = category, s = sort) => {
    const seq = ++searchSeq.current
    setBusy(true)
    setError(null)
    try {
      const result = await search(q, c || undefined, 500, s)
      if (seq !== searchSeq.current) return
      setItems(result)
    } catch (e) {
      if (seq !== searchSeq.current) return
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (seq === searchSeq.current) setBusy(false)
    }
  }

  useEffect(() => {
    void runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 输入即搜（防抖）
  useEffect(() => {
    if (skipInitialDebounce.current) {
      skipInitialDebounce.current = false
      return
    }
    const timer = setTimeout(() => void runSearch(query), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // 点选分类：切换分类并立即按新分类重新搜索。
  const onPickCategory = (value: string) => {
    if (value === category) return
    setCategory(value)
    void runSearch(query, value)
  }

  // 切换排序：立即按新排序重新搜索。
  const onPickSort = (value: SortMode) => {
    if (value === sort) return
    setSort(value)
    void runSearch(query, category, value)
  }

  // 安装状态由服务端在搜索时计算并随结果返回（URL 唯一身份）。
  const installedByUrl = useMemo(() => {
    const map = new Map<string, PluginHit>()
    for (const p of items ?? []) if (p.installed) map.set(p.url, p)
    return map
  }, [items])

  const isInstalled = (p: PluginHit) => installedByUrl.has(p.url)

  const filterCounts = useMemo(() => {
    let installedCount = 0
    if (items != null) {
      for (const p of items) if (isInstalled(p)) installedCount++
    }
    return { installed: installedCount, uninstalled: (items?.length ?? 0) - installedCount }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, installedByUrl])

  const visibleItems =
    items == null
      ? null
      : items.filter((p) => {
          if (installFilter === 'installed') return isInstalled(p)
          if (installFilter === 'uninstalled') return !isInstalled(p)
          return true
        })

  // 执行安装：锁定该插件，成功后展示通知并刷新列表。
  const doInstall = async (p: PluginHit) => {
    setInstalling(p.url)
    setError(null)
    setNotice(null)
    try {
      const result = await install(p.url)
      setNotice(result.message)
      if (result.ok) void runSearch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(null)
    }
  }

  // 执行卸载：流程与安装一致，成功后展示通知并刷新列表。
  const doUninstall = async (p: PluginHit) => {
    setInstalling(p.url)
    setError(null)
    setNotice(null)
    try {
      const result = await uninstall(p.url)
      setNotice(result.message)
      if (result.ok) void runSearch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(null)
    }
  }

  const onInstall = (p: PluginHit) => setConfirm({ plugin: p, action: 'install' })
  const onUninstall = (p: PluginHit) => setConfirm({ plugin: p, action: 'uninstall' })

  return (
    <div className="dpr-root">
      <style>{STYLES}</style>

      <div className="dpr-toolbar">
        <div className="dpr-input-wrap">
          <input
            type="search"
            className="dpr-input"
            value={query}
            placeholder="搜索插件，如「微信通知」「TUI」"
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              // 中文输入法组词期间的 Enter 用于上屏，不应触发搜索
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) void runSearch()
            }}
          />
          {query ? (
            <button type="button" className="dpr-clear-btn" aria-label="清空搜索" onClick={() => setQuery('')}>
              ×
            </button>
          ) : null}
        </div>
        <label className="dpr-sort" title="排序">
          <span className="dpr-sort-label">排序</span>
          <span className="dpr-sort-wrap">
            <select
              className="dpr-sort-select"
              aria-label="排序"
              value={sort}
              onChange={(e) => onPickSort(e.currentTarget.value as SortMode)}
            >
              <option value="relevance">相关度</option>
              <option value="stars">按 Star</option>
              <option value="recent">按最新</option>
            </select>
          </span>
        </label>
        <button type="button" className="dpr-search-btn" onClick={() => void runSearch()} disabled={busy}>
          {busy ? '搜索中…' : '搜索'}
        </button>
      </div>

      <div className="dpr-filter-row">
        <span className="dpr-filter-label">分类</span>
        <div className="dpr-chips">
          {CATEGORIES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`dpr-chip${category === value ? ' active' : ''}`}
              onClick={() => onPickCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dpr-filter-row">
        <span className="dpr-filter-label">状态</span>
        <div className="dpr-chips">
          {(['installed', 'uninstalled'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`dpr-chip${installFilter === value ? ' active' : ''}`}
              onClick={() => setInstallFilter((prev) => (prev === value ? null : value))}
            >
              {value === 'installed' ? '已安装' : '未安装'}
              {items != null ? (
                <span className="dpr-chip-count">
                  {value === 'installed' ? filterCounts.installed : filterCounts.uninstalled}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {error != null ? (
        <div className="dpr-banner error" role="alert">
          <span>{error}</span>
          <button type="button" className="dpr-banner-close" aria-label="关闭" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      ) : null}
      {notice != null ? (
        <div className="dpr-banner notice" role="status">
          <span>{notice}</span>
          <button type="button" className="dpr-banner-close" aria-label="关闭" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      ) : null}

      {busy && items != null ? (
        <div className="dpr-progress" role="progressbar" aria-label="正在检索">
          <div className="dpr-progress-bar" />
        </div>
      ) : null}

      {items == null && busy ? (
        <ul className="dpr-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="dpr-skel-card" />
          ))}
        </ul>
      ) : null}

      {!busy && items != null && items.length === 0 ? (
        <div className="dpr-empty">
          没有匹配的插件。
          <br />
          换更宽泛的关键词，或浏览 awesome-dsh-plugin.com
        </div>
      ) : null}

      {!busy && items != null && items.length > 0 && visibleItems != null && visibleItems.length === 0 ? (
        <div className="dpr-empty">没有符合当前筛选条件的插件。</div>
      ) : null}

      {visibleItems != null && visibleItems.length > 0 ? (
        <div className={`dpr-results${busy ? ' busy' : ''}`}>
          <div className="dpr-meta">
            共 {visibleItems.length} 个插件
            {installFilter != null ? `（仅显示${installFilter === 'installed' ? '已安装' : '未安装'}）` : ''}
          </div>
          <ul className="dpr-grid">
            {visibleItems.map((p) => {
              const pInstalled = isInstalled(p)
              return (
                <li key={p.url} className="dpr-card">
                  <div className="dpr-card-head">
                    <span className="dpr-card-name" title={p.name}>
                      {p.name}
                    </span>
                    <span className="dpr-card-tags">
                      {pInstalled ? <span className="dpr-badge installed">已安装</span> : null}
                      {p.category ? <span className="dpr-badge">{CATEGORY_LABEL[p.category] ?? p.category}</span> : null}
                    </span>
                  </div>
                  <div className="dpr-card-desc">{p.description}</div>
                  <div className="dpr-card-foot">
                    <div className="dpr-card-meta">
                      <a className="dpr-card-link" href={p.url} target="_blank" rel="noreferrer" title={p.url}>
                        {p.owner}/{p.name}
                      </a>
                      {p.stars != null || p.createdAt != null ? (
                        <span className="dpr-card-stat">
                          {p.stars != null ? `★ ${p.stars.toLocaleString()}` : ''}
                          {p.stars != null && p.createdAt != null ? ' · ' : ''}
                          {p.createdAt != null ? p.createdAt.replace(/-/g, '.') : ''}
                        </span>
                      ) : null}
                    </div>
                    {pInstalled ? (
                      <button
                        type="button"
                        className="dpr-uninstall-btn"
                        onClick={() => onUninstall(p)}
                        disabled={installing === p.url}
                      >
                        {installing === p.url ? '卸载中…' : '卸载'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="dpr-install-btn"
                        onClick={() => onInstall(p)}
                        disabled={installing === p.url}
                      >
                        {installing === p.url ? '安装中…' : '安装'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {confirm != null ? (
        <ConfirmModal
          plugin={confirm.plugin}
          action={confirm.action}
          busy={installing != null}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const { plugin, action } = confirm
            setConfirm(null)
            if (action === 'install') void doInstall(plugin)
            else void doUninstall(plugin)
          }}
        />
      ) : null}
    </div>
  )
}

interface ConfirmModalProps {
  plugin: PluginHit
  action: 'install' | 'uninstall'
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmModal({ plugin, action, busy, onCancel, onConfirm }: ConfirmModalProps) {
  // 弹窗键盘操作：Esc 取消、Enter 确认；处理中（busy）时禁用快捷键避免误触。
  useEffect(() => {
    if (busy) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onCancel, onConfirm])

  const installing = action === 'install'

  return (
    <div
      className="dpr-modal-overlay"
      onClick={() => {
        if (!busy) onCancel()
      }}
    >
      <div
        className="dpr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={installing ? '确认安装' : '确认卸载'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dpr-modal-title">{installing ? '确认安装' : '确认卸载'}</div>
        <div className="dpr-modal-body">
          <div className="dpr-modal-name">{plugin.name}</div>
          <a className="dpr-modal-link" href={plugin.url} target="_blank" rel="noreferrer" title={plugin.url}>
            {plugin.url}
          </a>
          <div className="dpr-modal-warn">
            {installing
              ? '该插件为第三方代码，安装前请确认已审阅其源码。'
              : '将移除该插件的依赖与插件层（bundle）条目，HMR 热加载生效。'}
          </div>
        </div>
        <div className="dpr-modal-foot">
          <button type="button" className="dpr-modal-btn cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button
            type="button"
            className={`dpr-modal-btn ${installing ? 'confirm' : 'danger'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? '处理中…' : installing ? '确认安装' : '确认卸载'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 客户端插件入口：在 DSH web shell 的「插件」设置页注册一个「插件市场」页签。
export function apply(ctx: Context) {
  const slots = (ctx as unknown as { slots: any }).slots

  // 搜索：query/category/sort/limit 拼进 URL 查询串，GET 宿主 /search 接口。
  const search = (q: string, category?: string, limit = 20, sort: SortMode = 'stars'): Promise<PluginHit[]> => {
    const params = new URLSearchParams({ q, limit: String(limit) })
    if (category) params.set('category', category)
    if (sort !== 'relevance') params.set('sort', sort)
    return api(`/api/dsh-plugin-registry/search?${params.toString()}`).then((d) => d.plugins)
  }

  // 安装：POST 宿主 /install 接口，body 带 ref（唯一 URL 身份）。
  const install = (ref: string): Promise<InstallResult> =>
    api('/api/dsh-plugin-registry/install', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref }),
    }).then((d) => d.result)

  // 卸载：POST 宿主 /uninstall 接口，同样以 ref 定位。
  const uninstall = (ref: string): Promise<UninstallResult> =>
    api('/api/dsh-plugin-registry/uninstall', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref }),
    }).then((d) => d.result)

  // 注入 settings.plugins.tab 页签（id=market），并把三个操作作为 props 传给 Market 组件。
  slots.inject('settings.plugins.tab', () =>
    slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'market',
        order: 20,
        label: '插件市场',
        inject: () => ({ search, install, uninstall }),
      },
      Market,
    ),
  )
}
