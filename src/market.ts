import type { ProfileStore } from './profile.js'
import { describe, searchPlugins } from './registry.js'
import type { Registry, SortMode } from './registry.js'
import type { SearchHit } from './types.js'

/**
 * 搜索 registry 并附加服务端计算的安装状态（URL 身份）。
 * HTTP 与 DSH 工具共用同一视图。
 */
export function searchHits(
  registry: Registry,
  profile: ProfileStore,
  query: string,
  category: string | undefined,
  limit: number,
  lang: 'zh' | 'en',
  sort: SortMode = 'relevance',
): SearchHit[] {
  const found = searchPlugins(registry, query, category, limit, sort)
  // 一次读取全部已装条目并按 URL 建索引，供下面每条结果 O(1) 查安装状态。
  const installed = new Map(profile.installedEntries(registry.plugins).map((e) => [e.url, e]))
  return found.map((p) => {
    const entry = installed.get(p.url)
    return {
      url: p.url,
      name: p.name,
      owner: p.owner,
      category: p.category,
      description: describe(p, lang),
      install: p.install ?? '',
      npm: p.npm,
      stars: p.stars ?? null,
      createdAt: p.createdAt ?? null,
      installed: entry != null,
      packageName: entry?.packageName ?? null,
    }
  })
}
