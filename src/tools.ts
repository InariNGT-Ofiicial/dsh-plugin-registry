import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { loadRegistry, resolvePlugin } from './registry.js'
import { searchHits } from './market.js'
import type { ProfileStore } from './profile.js'
import type { SearchHit } from './types.js'

// 把搜索结果格式化成给 agent 阅读的纯文本（含安装命令与已装状态标记）。
function renderSearch(results: SearchHit[], note: string): string {
  if (results.length === 0) {
    return '没有匹配的插件。换更宽泛的关键词，或浏览 https://awesome-dsh-plugin.com'
  }
  const lines = results.map(
    (r, i) =>
      `${i + 1}. ${r.name}${r.installed ? ' ✅ 已安装' : ''} — ${r.description}\n   ${r.url}\n   install: ${r.install}`,
  )
  return lines.join('\n\n') + (note ? `\n\n${note}` : '')
}

// 注册两个面向 agent 的 DSH 工具：检索与安装。
export function registerTools(ctx: Context, profile: ProfileStore): void {
  ctx.tools.register(
    defineTool({
      name: 'search_dsh_plugins',
      description:
        '在 awesome-dsh-plugin 精选 registry 中检索 DeepSeek Harness 插件（按关键词或分类过滤），' +
        '返回双语描述、安装命令与当前 profile 的安装状态。当用户想要 DSH 目前没有的能力、或询问有哪些插件时使用。',
      parameters: {
        query: {
          type: 'string',
          required: true,
          description: '描述所需能力的关键词，如「微信通知」「TUI」「跨会话记忆」',
        },
        category: {
          type: 'string',
          description: '可选，按分类过滤：ui/theme/session/memory/tools/skill/workflow/notify/model/dev/fun',
        },
        limit: { type: 'number', description: '最多返回条数（默认 8，最大 20）' },
        lang: { type: 'string', description: "描述语言 'zh' 或 'en'，默认 'zh'" },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_args, value) => {
          const v = value as { results?: SearchHit[]; note?: string }
          return [{ type: 'text', text: renderSearch(v.results ?? [], v.note ?? '') }]
        },
      },
      // 只读检索，可并发安全执行。
      isConcurrencySafe: () => true,
      execute: async (args) => {
        const registry = await loadRegistry()
        const limit = Math.max(1, Math.min(args.limit ?? 8, 20))
        const category = typeof args.category === 'string' ? args.category : undefined
        const lang = args.lang === 'en' ? 'en' : 'zh'
        const results = searchHits(registry, profile, String(args.query ?? ''), category, limit, lang)
        return {
          results,
          note: '来源：awesome-dsh-plugin 精选列表。插件为第三方代码，安装前建议先向用户确认并审阅源码。',
        }
      },
    }),
  )

  ctx.tools.register(
    defineTool({
      name: 'install_dsh_plugin',
      description:
        '从 awesome-dsh-plugin registry 安装一个插件到当前 profile（corepack pnpm add + 同步 dsh.profile.bundles，' +
        'HMR 热加载，无需重启）。只安装 registry 中已收录的插件；第三方代码，执行前必须已获用户确认。' +
        '同名插件请用完整 URL 指定，避免装错仓库。',
      parameters: {
        ref: {
          type: 'string',
          required: true,
          description: '插件唯一 URL（https://github.com/owner/repo，推荐）、唯一名称或 owner/repo',
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: (_args, value) => {
          const v = value as { message?: string }
          return [{ type: 'text', text: v.message ?? JSON.stringify(value) }]
        },
      },
      // 会改动 profile 依赖，非并发安全，串行执行。
      isConcurrencySafe: () => false,
      execute: async (args) => {
        const registry = await loadRegistry()
        // 解析 ref → 唯一 registry 条目，失败时返回可读错误信息。
        const resolved = resolvePlugin(registry, String(args.ref ?? ''))
        if (!resolved.ok) return { ok: false, message: resolved.message }
        return profile.install(resolved.plugin)
      },
      // 安装可能需要下载依赖，放宽超时上限。
      timeoutMs: 300000,
    }),
  )
}
