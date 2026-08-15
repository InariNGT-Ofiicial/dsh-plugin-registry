import type { Context } from '@deepseek-ai/cordis'
import { loadRegistry, searchPlugins, findPlugin, installSpec } from './registry.js'
import { installPlugin, type InstallContext } from './install.js'

interface WebServer {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: any, res: any) => void | Promise<void>
  }): () => void
}

function sendJson(res: any, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

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

export function registerRoutes(ctx: Context, webServer: WebServer): void {
  webServer.register({
    kind: 'prefix',
    path: '/api/dsh-plugin-registry',
    handler: async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost')
      try {
        if (url.pathname === '/api/dsh-plugin-registry/search' && req.method === 'GET') {
          const registry = await loadRegistry()
          const query = url.searchParams.get('q') ?? ''
          const category = url.searchParams.get('category') ?? undefined
          const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit')) || 8, 500))
          const found = searchPlugins(registry, query, category, limit)
          sendJson(res, 200, {
            ok: true,
            plugins: found.map((p) => ({
              name: p.name,
              owner: p.owner,
              url: p.url,
              category: p.category,
              description: p.description,
              install: p.install ?? '',
              npm: p.npm,
            })),
          })
          return
        }
        if (url.pathname === '/api/dsh-plugin-registry/install' && req.method === 'POST') {
          const body = await readJsonBody(req)
          const ref = String(body.ref ?? '')
          const registry = await loadRegistry()
          const plugin = findPlugin(registry, ref)
          if (!plugin) {
            sendJson(res, 404, { ok: false, error: `未在 registry 中找到「${ref}」。请先搜索再按精确名称安装。` })
            return
          }
          const spec = installSpec(plugin)
          const result = await installPlugin(ctx as unknown as InstallContext, spec, plugin.npm, plugin.name)
          sendJson(res, 200, { ok: true, result })
          return
        }
        sendJson(res, 404, { ok: false, error: 'not found' })
      } catch (error) {
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  })
}
