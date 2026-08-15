import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export interface RegistryPlugin {
  name: string
  owner: string
  url: string
  category: string
  description: Record<string, string>
  npm: string | null
  stars?: number
  install: string
  added: string
}

export interface Registry {
  updated: string
  count: number
  categories: Record<string, Record<string, string>>
  plugins: RegistryPlugin[]
}

const REGISTRY_URL = 'https://raw.githubusercontent.com/beancookie/awesome-dsh-plugin/main/docs/plugins.json'
const TTL_MS = 60 * 60 * 1000

let cache: { at: number; data: Registry } | null = null

function snapshot(): Registry {
  const path = fileURLToPath(new URL('../data/registry-snapshot.json', import.meta.url))
  return JSON.parse(readFileSync(path, 'utf8')) as Registry
}

export async function loadRegistry(): Promise<Registry> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data
  try {
    const res = await fetch(REGISTRY_URL, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Registry
    if (!Array.isArray(data.plugins) || data.plugins.length === 0) throw new Error('empty registry')
    cache = { at: Date.now(), data }
    return data
  } catch {
    return cache?.data ?? snapshot()
  }
}

export function searchPlugins(registry: Registry, query: string, category?: string, limit = 8): RegistryPlugin[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const scored = registry.plugins
    .filter((p) => (category ? p.category === category : true))
    .map((p) => {
      if (terms.length === 0) return { p, score: 0 }
      const hay = [p.name, p.owner, ...Object.values(p.description ?? {})].join(' ').toLowerCase()
      if (!terms.every((t) => hay.includes(t))) return null
      const name = p.name.toLowerCase()
      const score = terms.reduce((s, t) => s + (name.includes(t) ? 2 : 1), 0)
      return { p, score }
    })
    .filter((x): x is { p: RegistryPlugin; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, Math.max(1, Math.min(limit, 500))).map((x) => x.p)
}

export function findPlugin(registry: Registry, ref: string): RegistryPlugin | null {
  const r = ref.trim()
  const lower = r.toLowerCase()
  const byUrl = registry.plugins.find((p) => p.url.toLowerCase() === lower)
  if (byUrl) return byUrl
  const byName = registry.plugins.find((p) => p.name.toLowerCase() === lower)
  if (byName) return byName
  const repo = r.replace(/^https:\/\/github\.com\//i, '').replace(/\.git$/, '')
  const byRepo = registry.plugins.find((p) => {
    const pu = p.url.replace(/^https:\/\/github\.com\//i, '').replace(/\.git$/, '')
    return pu.toLowerCase() === repo.toLowerCase()
  })
  return byRepo ?? null
}

export function installSpec(p: RegistryPlugin): string {
  const m = p.install?.match(/add\s+(.+)$/)
  const spec = m ? m[1].trim() : ''
  // beancookie 版对 monorepo 子包生成的是 github:owner/repo/tree/main/...（无效），
  // 从 url 重建 github:owner/repo#path:/sub
  if (/^github:.+\/tree\//.test(spec)) {
    const tree = p.url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/tree\/[^/]+\/(.+)$/)
    if (tree) return `github:${tree[1]}#path:/${tree[2]}`
  }
  if (spec) return spec
  if (p.npm) return p.npm
  return `github:${p.url.replace(/^https:\/\/github\.com\//, '')}`
}
