import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

interface LoaderEntry {
  id: string
  options?: { name?: string; config?: { path?: string } }
}

export interface InstallContext {
  loader: {
    entries(): LoaderEntry[]
  }
}

export type InstallResult = {
  ok: boolean
  spec: string
  packageName: string
  entryId: string | null
  profileDir: string
  message: string
  alreadyInstalled: boolean
}

// --- profile discovery (mirrors @deepseek-ai/dsh-plugin-console) ---

function dshHome(): string {
  return process.env.DSH_HOME?.trim() || join(homedir(), '.dsh')
}

function defaultPatchPath(): string {
  return join(dshHome(), 'profiles', 'web', 'cordis.patch.yml')
}

function findPatchPath(ctx: InstallContext): string {
  for (const entry of ctx.loader.entries()) {
    const cfg = entry.options?.config
    if (entry.options?.name !== 'cordis:include' || cfg == null || typeof cfg.path !== 'string') continue
    if (!cfg.path.includes('cordis.yml')) continue
    const configPath = fileURLToPath(new URL(cfg.path))
    return configPath.replace(/cordis\.yml$/, 'cordis.patch.yml')
  }
  return defaultPatchPath()
}

// --- cordis.patch.yml ---

async function readPatchState(patchPath: string): Promise<{ inserts: string[]; text: string }> {
  let text = ''
  try {
    text = await readFile(patchPath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const inserts: string[] = []
  const lines = text.split(/\r?\n/)
  let inInsert = false
  for (const line of lines) {
    if (/^- insert:\s*$/.test(line)) { inInsert = true; continue }
    if (/^- /.test(line)) inInsert = false
    if (inInsert) {
      const m = line.match(/^ {4}- id: ([A-Za-z0-9_.-]+)/)
      if (m) inserts.push(m[1])
    }
  }
  return { inserts, text }
}

function deriveEntryId(packageName: string, taken: Set<string>): string {
  const base = packageName
    .replace(/^@/, '')
    .replace(/\//g, '-')
    .replace(/[^A-Za-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'plugin'
  if (!taken.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) return candidate
  }
  throw new Error('无法为插件生成唯一的 entry id')
}

let writeQueue: Promise<unknown> = Promise.resolve()
function queuedWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn)
  writeQueue = run.then(() => undefined, () => undefined)
  return run
}

async function appendInsert(patchPath: string, entryId: string, packageName: string): Promise<boolean> {
  return queuedWrite(async () => {
    const { inserts, text } = await readPatchState(patchPath)
    if (inserts.includes(entryId)) return false
    const next = text.length === 0 || text.endsWith('\n') ? text : `${text}\n`
    const block = `- insert:\n    - id: ${entryId}\n      name: '${packageName}'\n`
    await writeFile(patchPath, `${next}${block}`, 'utf8')
    return true
  })
}

// --- install via corepack pnpm (profile dir is managed by pnpm) ---

async function pnpmInstall(profileDir: string, spec: string): Promise<void> {
  const args = ['pnpm', 'add', spec]
  const opts = {
    cwd: profileDir,
    timeout: 240000,
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env },
  }
  if (process.platform === 'win32') {
    // .cmd shims can't be execFile'd directly (EINVAL): run corepack.js via node
    const corepackJs = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'corepack.js')
    if (existsSync(corepackJs)) {
      await execFileAsync(process.execPath, [corepackJs, ...args], opts)
      return
    }
    const cmd = `corepack ${args.map((a) => JSON.stringify(a)).join(' ')}`
    await execFileAsync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', cmd], opts)
    return
  }
  await execFileAsync('corepack', args, opts)
}

// --- package name resolution for the patch `name` field ---

function parseGithubSpec(spec: string): { repo: string; sub?: string } | null {
  const m = spec.match(/^github:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:#path:([^#]+))?$/)
  if (!m) return null
  return { repo: m[1], sub: m[2] ? m[2].replace(/^\/+/, '') : undefined }
}

async function fetchRepoPackageName(repo: string, sub?: string): Promise<string | null> {
  const file = sub ? `${sub}/package.json` : 'package.json'
  const url = `https://raw.githubusercontent.com/${repo}/HEAD/${encodeURIComponent(file)}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const pkg = (await res.json()) as { name?: unknown }
    return typeof pkg.name === 'string' && pkg.name ? pkg.name : null
  } catch {
    return null
  }
}

async function resolvePackageName(spec: string, npm: string | null, fallback: string): Promise<string> {
  if (npm) return npm
  const gh = parseGithubSpec(spec)
  if (gh) {
    const found = await fetchRepoPackageName(gh.repo, gh.sub)
    if (found) return found
    return gh.repo.split('/')[1] ?? fallback
  }
  return fallback
}

export async function installPlugin(
  ctx: InstallContext,
  spec: string,
  npm: string | null,
  fallbackName: string,
): Promise<InstallResult> {
  const patchPath = findPatchPath(ctx)
  const profileDir = dirname(patchPath)
  const packageName = await resolvePackageName(spec, npm, fallbackName)

  const already = ctx.loader.entries().some((e) => e.options?.name === packageName)
  if (already) {
    return {
      ok: true,
      spec,
      packageName,
      entryId: null,
      profileDir,
      message: `插件 ${packageName} 已安装，无需重复安装。`,
      alreadyInstalled: true,
    }
  }

  await pnpmInstall(profileDir, spec)

  const patch = await readPatchState(patchPath)
  const taken = new Set<string>(patch.inserts)
  for (const e of ctx.loader.entries()) taken.add(e.id)
  const entryId = deriveEntryId(packageName, taken)
  const changed = await appendInsert(patchPath, entryId, packageName)

  return {
    ok: true,
    spec,
    packageName,
    entryId,
    profileDir,
    message: changed
      ? `已安装 ${packageName}，写入条目 ${entryId}，HMR 热加载生效（无需重启）。`
      : `已安装 ${packageName}，补丁中已存在条目 ${entryId}。`,
    alreadyInstalled: false,
  }
}
