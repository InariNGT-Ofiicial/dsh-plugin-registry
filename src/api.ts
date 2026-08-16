import { loadRegistry, resolvePlugin } from './registry.js'
import { searchHits } from './market.js'
import type { ProfileStore } from './profile.js'

// DSH webServer 的最小接口：只需 register 一个 prefix 路由即可。
interface WebServer {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: any, res: any) => void | Promise<void>
  }): () => void
}

// 统一 JSON 响应：写状态码 + content-type 头 + JSON body。
function sendJson(res: any, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

// 读取请求体并解析为 JSON 对象；空体或非法 JSON 都归一化为空对象，不抛异常。
async function readJsonBody(req: any): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  try {
    const parsed = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/**
 * 注册一个 /api/dsh-plugin-registry 前缀路由，集中处理搜索、已装列表、安装、卸载四类请求。
 * 全部复用 registry/market/profile 的同一套逻辑，与 DSH 工具共享同一 ProfileStore。
 */
export function registerRoutes(webServer: WebServer, profile: ProfileStore): void {
  webServer.register({
    kind: 'prefix',
    path: '/api/dsh-plugin-registry',
    handler: async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost')
      try {
        // GET /search —— 检索插件并附服务端算好的安装状态。
        if (url.pathname === '/api/dsh-plugin-registry/search' && req.method === 'GET') {
          const registry = await loadRegistry()
          const query = url.searchParams.get('q') ?? ''
          const category = url.searchParams.get('category') ?? undefined
          const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit')) || 8, 500))
          sendJson(res, 200, { ok: true, plugins: searchHits(registry, profile, query, category, limit, 'zh') })
          return
        }
        // GET /installed —— 返回 registry 中所有已安装的条目。
        if (url.pathname === '/api/dsh-plugin-registry/installed' && req.method === 'GET') {
          const registry = await loadRegistry()
          sendJson(res, 200, { ok: true, installed: profile.installedEntries(registry.plugins) })
          return
        }
        // POST /install 与 POST /uninstall —— 共用同一解析 + 安装/卸载分支。
        if (
          (url.pathname === '/api/dsh-plugin-registry/install' || url.pathname === '/api/dsh-plugin-registry/uninstall') &&
          req.method === 'POST'
        ) {
          const body = await readJsonBody(req)
          const ref = String(body.ref ?? '')
          const registry = await loadRegistry()
          // 先把用户给的 ref 解析成唯一 registry 条目；歧义/未命中直接返回错误。
          const resolved = resolvePlugin(registry, ref)
          if (!resolved.ok) {
            sendJson(res, resolved.code === 'ambiguous' ? 409 : 404, { ok: false, error: resolved.message })
            return
          }
          const result =
            url.pathname.endsWith('/uninstall')
              ? await profile.uninstall(resolved.plugin)
              : await profile.install(resolved.plugin)
          sendJson(res, 200, { ok: true, result })
          return
        }
        // 未匹配到任何已知路由。
        sendJson(res, 404, { ok: false, error: 'not found' })
      } catch (error) {
        // 兜底：任何未捕获异常都转成 500，避免服务器进程崩溃。
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  })
}
