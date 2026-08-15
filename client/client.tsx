import type { Context } from '@deepseek-ai/cordis'
import { useEffect, useState } from 'react'

export const name = 'dsh-plugin-registry'
export const inject = ['slots']

interface PluginHit {
  name: string
  owner: string
  url: string
  category: string
  description: Record<string, string>
  install: string
  npm: string | null
}

interface InstallResult {
  ok: boolean
  alreadyInstalled: boolean
  spec: string
  packageName: string
  profileDir: string
  message: string
}

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
`

function describe(p: PluginHit): string {
  return p.description?.zh ?? p.description?.en ?? ''
}

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
  search: (query: string, category?: string, limit?: number) => Promise<PluginHit[]>
  install: (ref: string) => Promise<InstallResult>
}

function Market({ search, install }: MarketProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState<PluginHit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [installing, setInstalling] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const runSearch = async (q = query, c = category) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      setItems(await search(q, c || undefined, 500))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPickCategory = (value: string) => {
    setCategory(value)
    void runSearch(query, value)
  }

  const onInstall = async (p: PluginHit) => {
    if (!window.confirm(`即将安装第三方插件「${p.name}」（${p.url}）。\n插件为第三方代码，确定继续？`)) return
    setInstalling(p.name)
    setError(null)
    setNotice(null)
    try {
      const result = await install(p.name)
      setNotice(result.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(null)
    }
  }

  return (
    <div className="dpr-root">
      <style>{STYLES}</style>

      <div className="dpr-toolbar">
        <input
          type="search"
          className="dpr-input"
          value={query}
          placeholder="搜索插件，如「微信通知」「TUI」"
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void runSearch()
          }}
        />
        <button type="button" className="dpr-search-btn" onClick={() => void runSearch()} disabled={busy}>
          {busy ? '搜索中…' : '搜索'}
        </button>
      </div>

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

      {error != null ? (
        <div className="dpr-banner error" role="alert">
          {error}
        </div>
      ) : null}
      {notice != null ? (
        <div className="dpr-banner notice" role="status">
          {notice}
        </div>
      ) : null}

      {busy ? <div className="dpr-meta">正在检索…</div> : null}

      {!busy && items != null && items.length === 0 ? (
        <div className="dpr-empty">没有匹配的插件。换更宽泛的关键词，或浏览 awesome-dsh-plugin.com</div>
      ) : null}

      {!busy && items != null && items.length > 0 ? (
        <>
          <div className="dpr-meta">共 {items.length} 个插件</div>
          <ul className="dpr-grid">
            {items.map((p) => (
              <li key={p.name} className="dpr-card">
                <div className="dpr-card-head">
                  <span className="dpr-card-name" title={p.name}>
                    {p.name}
                  </span>
                  {p.category ? <span className="dpr-badge">{CATEGORY_LABEL[p.category] ?? p.category}</span> : null}
                </div>
                <div className="dpr-card-desc">{describe(p)}</div>
                <div className="dpr-card-foot">
                  <a className="dpr-card-link" href={p.url} target="_blank" rel="noreferrer" title={p.url}>
                    {p.owner}/{p.name}
                  </a>
                  <button
                    type="button"
                    className="dpr-install-btn"
                    onClick={() => void onInstall(p)}
                    disabled={installing === p.name}
                  >
                    {installing === p.name ? '安装中…' : '安装'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

export function apply(ctx: Context) {
  const slots = (ctx as unknown as { slots: any }).slots

  const search = (q: string, category?: string, limit = 20): Promise<PluginHit[]> => {
    const params = new URLSearchParams({ q, limit: String(limit) })
    if (category) params.set('category', category)
    return api(`/api/dsh-plugin-registry/search?${params.toString()}`).then((d) => d.plugins)
  }

  const install = (ref: string): Promise<InstallResult> =>
    api('/api/dsh-plugin-registry/install', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref }),
    }).then((d) => d.result)

  slots.inject('settings.section', () =>
    slots.register(
      {
        name: 'settings.section',
        id: 'dsh-plugin-registry',
        order: 100,
        label: '插件市场',
        inject: () => ({ search, install }),
      },
      Market,
    ),
  )
}
