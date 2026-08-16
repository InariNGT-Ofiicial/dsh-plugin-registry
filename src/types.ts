// 共享类型：registry 原始条目与搜索/安装结果的展示视图。
// 全部集中在单一文件，供 registry/market/profile/api/tools 复用。

// registry plugins.json 中单条插件的原始结构。
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

/**
 * 搜索结果中单条插件的展示视图（含服务端算好的安装状态）。
 * 注意：必须是 type（而非 interface），才能赋给 defineTool 的
 * Record<string, JsonValue> 输出约束。
 */
export type SearchHit = {
  url: string
  name: string
  owner: string
  category: string
  description: string
  install: string
  npm: string | null
  installed: boolean
  /** 已安装时的真实包名（profile 依赖名），未安装为 null。 */
  packageName: string | null
}

/** 已安装插件条目：url 是唯一身份。 */
export type InstalledEntry = {
  url: string
  name: string
  packageName: string
  /** 是否在 profile 插件层（dsh.profile.bundles）中。 */
  bundled: boolean
}

// 安装结果：来自 ProfileStore.install()，由工具与 HTTP API 原样回传。
export type InstallResult = {
  ok: boolean
  alreadyInstalled: boolean
  url: string
  name: string
  packageName: string
  bundled: boolean
  profileDir: string
  message: string
}

// 卸载结果：来自 ProfileStore.uninstall()。
export type UninstallResult = {
  ok: boolean
  url: string
  name: string
  packageName: string
  profileDir: string
  message: string
}
