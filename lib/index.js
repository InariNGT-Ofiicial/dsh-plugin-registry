import { defineTool } from '@deepseek-ai/dsh-tools';
import { loadRegistry, searchPlugins, findPlugin, installSpec } from './registry.js';
import { installPlugin } from './install.js';
import { registerRoutes } from './server.js';
export const name = 'dsh-plugin-registry';
export const inject = ['tools', 'loader'];
function renderSearch(results, note) {
    if (results.length === 0) {
        return '没有匹配的插件。换更宽泛的关键词，或浏览 https://awesome-dsh-plugin.com';
    }
    const lines = results.map((r, i) => `${i + 1}. ${r.name} — ${r.description}\n   ${r.url}\n   install: ${r.install}`);
    return lines.join('\n\n') + (note ? `\n\n${note}` : '');
}
export function apply(ctx) {
    ctx.tools.register(defineTool({
        name: 'search_dsh_plugins',
        description: '在 awesome-dsh-plugin 精选 registry 中检索 DeepSeek Harness 插件（按关键词或分类过滤），' +
            '返回双语描述与安装命令。当用户想要 DSH 目前没有的能力、或询问有哪些插件时使用。',
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
                const v = value;
                return [{ type: 'text', text: renderSearch(v.results ?? [], v.note ?? '') }];
            },
        },
        isConcurrencySafe: () => true,
        execute: async (args) => {
            const registry = await loadRegistry();
            const limit = Math.max(1, Math.min(args.limit ?? 8, 20));
            const category = typeof args.category === 'string' ? args.category : undefined;
            const found = searchPlugins(registry, String(args.query ?? ''), category, limit);
            const lang = args.lang === 'en' ? 'en' : 'zh';
            const results = found.map((p) => ({
                name: p.name,
                owner: p.owner,
                url: p.url,
                category: p.category,
                description: p.description?.[lang] ?? p.description?.en ?? '',
                install: p.install ?? '',
            }));
            return {
                results,
                note: '来源：awesome-dsh-plugin 精选列表。插件为第三方代码，安装前建议先向用户确认并审阅源码。',
            };
        },
    }));
    ctx.tools.register(defineTool({
        name: 'install_dsh_plugin',
        description: '从 awesome-dsh-plugin registry 安装一个插件到当前 profile（corepack pnpm 安装 + 写入 cordis.patch.yml，' +
            'HMR 热加载，无需重启）。只安装 registry 中已收录的插件；第三方代码，执行前必须已获用户确认。',
        parameters: {
            ref: {
                type: 'string',
                required: true,
                description: '插件名称（如 dsh-pet）、完整 URL（https://github.com/owner/repo）或 owner/repo',
            },
        },
        output: {
            schema: { type: 'object', additionalProperties: true },
            render: (_args, value) => {
                const v = value;
                return [{ type: 'text', text: v.message ?? JSON.stringify(value) }];
            },
        },
        isConcurrencySafe: () => false,
        execute: async (args) => {
            const registry = await loadRegistry();
            const plugin = findPlugin(registry, String(args.ref ?? ''));
            if (!plugin) {
                return {
                    ok: false,
                    message: `未在 registry 中找到「${args.ref}」。请先用 search_dsh_plugins 检索，再按精确名称/URL 安装。`,
                };
            }
            const spec = installSpec(plugin);
            return installPlugin(ctx, spec, plugin.npm, plugin.name);
        },
        timeoutMs: 300000,
    }));
    ctx.inject(['webServer'], (wctx) => {
        registerRoutes(ctx, wctx.webServer);
    });
}
