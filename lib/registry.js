import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// 远程数据源与内存缓存 TTL（1 小时）。
const REGISTRY_URL = 'https://raw.githubusercontent.com/beancookie/awesome-dsh-plugin/main/docs/plugins.json';
const TTL_MS = 60 * 60 * 1000;
// 内存缓存：记录拉取时间，TTL 内直接复用，避免频繁请求远程。
let cache = null;
// 读取随包分发、离线可用的本地快照。
function snapshot() {
    const path = fileURLToPath(new URL('../data/registry-snapshot.json', import.meta.url));
    return JSON.parse(readFileSync(path, 'utf8'));
}
// 加载 registry：TTL 内用缓存；否则拉取远程，失败回退旧缓存或本地快照。
export async function loadRegistry() {
    if (cache && Date.now() - cache.at < TTL_MS)
        return cache.data;
    try {
        // 4 秒超时，避免离线/被墙时长时间卡住。
        const res = await fetch(REGISTRY_URL, { signal: AbortSignal.timeout(4000) });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = (await res.json());
        if (!Array.isArray(data.plugins) || data.plugins.length === 0)
            throw new Error('empty registry');
        cache = { at: Date.now(), data };
        return data;
    }
    catch {
        return cache?.data ?? snapshot();
    }
}
/**
 * 关键词检索：按 name/owner/description 做大小写不敏感的多关键词匹配。
 * 可选按分类过滤；排序规则是名称命中 +2 分、其余字段命中 +1 分，按总分降序。
 */
export function searchPlugins(registry, query, category, limit = 8) {
    // 把查询串拆成多个关键词，全部命中的条目才返回。
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const scored = registry.plugins
        .filter((p) => (category ? p.category === category : true))
        .map((p) => {
        // 空查询：不筛选，直接返回全部（分类过滤已在上一步完成）。
        if (terms.length === 0)
            return { p, score: 0 };
        // hay 汇集名称、所有者与双语描述，作为匹配文本。
        const hay = [p.name, p.owner, ...Object.values(p.description ?? {})].join(' ').toLowerCase();
        // 所有关键词都必须命中，否则该条目视为不匹配。
        if (!terms.every((t) => hay.includes(t)))
            return null;
        const name = p.name.toLowerCase();
        // 名称命中权重更高（+2），其余字段命中 +1。
        const score = terms.reduce((s, t) => s + (name.includes(t) ? 2 : 1), 0);
        return { p, score };
    })
        .filter((x) => x !== null)
        .sort((a, b) => b.score - a.score);
    // 限制返回条数（至少 1 条、最多 500 条），只取插件本体。
    return scored.slice(0, Math.max(1, Math.min(limit, 500))).map((x) => x.p);
}
/**
 * 从插件的 install 命令中提取 pnpm spec。registry 里可能出现
 * `github:owner/repo/tree/main/...`（无效）形态，这里从 url 重建为
 * `github:owner/repo#path:/sub`。
 */
export function installSpec(p) {
    const m = p.install?.match(/add\s+(.+)$/);
    const spec = m ? m[1].trim() : '';
    if (/^github:.+\/tree\//.test(spec)) {
        const tree = p.url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/tree\/[^/]+\/(.+)$/);
        if (tree)
            return `github:${tree[1]}#path:/${tree[2]}`;
    }
    if (spec)
        return spec;
    if (p.npm)
        return p.npm;
    return `github:${p.url.replace(/^https:\/\/github\.com\//, '')}`;
}
// 按语言取描述文本，缺省回退到英文，再回退到空串。
export function describe(p, lang) {
    return p.description?.[lang] ?? p.description?.en ?? '';
}
/**
 * 把用户提供的 ref 解析为唯一的 registry 条目。URL 是唯一身份；按 name
 * 匹配遇到重名（registry 中确有同名不同源条目）时返回歧义错误而非静默取第一条。
 */
export function resolvePlugin(registry, ref) {
    const r = ref.trim();
    const lower = r.toLowerCase();
    const byUrl = registry.plugins.filter((p) => p.url.toLowerCase() === lower);
    if (byUrl.length === 1)
        return { ok: true, plugin: byUrl[0], matchedBy: 'url' };
    if (byUrl.length > 1) {
        return {
            ok: false,
            code: 'ambiguous',
            message: `registry 中有多个条目匹配 ${ref}，请用唯一 URL 指定。`,
        };
    }
    const byName = registry.plugins.filter((p) => p.name.toLowerCase() === lower);
    if (byName.length === 1)
        return { ok: true, plugin: byName[0], matchedBy: 'name' };
    if (byName.length > 1) {
        return {
            ok: false,
            code: 'ambiguous',
            message: `registry 中有多个名为「${ref}」的插件，请用完整 URL 指定其中之一：${byName.map((p) => p.url).join('、')}`,
        };
    }
    const repo = r.replace(/^https:\/\/github\.com\//i, '').replace(/\.git$/, '');
    const byRepo = registry.plugins.filter((p) => {
        const pu = p.url.replace(/^https:\/\/github\.com\//i, '').replace(/\.git$/, '');
        return pu.toLowerCase() === repo.toLowerCase();
    });
    if (byRepo.length === 1)
        return { ok: true, plugin: byRepo[0], matchedBy: 'repo' };
    return {
        ok: false,
        code: 'not-found',
        message: `未在 registry 中找到「${ref}」。请先用 search 检索，再按精确名称/URL 安装。`,
    };
}
