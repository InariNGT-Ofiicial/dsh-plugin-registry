# dsh-plugin-registry

一个 DeepSeek Harness（DSH）插件：在会话内直接**检索**并**安装** [awesome-dsh-plugin](https://awesome-dsh-plugin.com) 精选列表中的插件。

- `search_dsh_plugins` — 按关键词/分类检索精选 registry，返回双语描述与安装命令。
- `install_dsh_plugin` — 真正把插件装进当前 profile（corepack pnpm 安装 + 写入 `cordis.patch.yml`，HMR 热加载，无需重启）。
- **可视化页面** — Web 设置页新增「插件市场」分区：搜索框 + 分类过滤 + 插件列表 + 一键安装（带确认弹窗），无需对话即可浏览/安装。

数据源：`https://raw.githubusercontent.com/beancookie/awesome-dsh-plugin/main/docs/plugins.json`（离线时回退到内置快照 `data/registry-snapshot.json`）。

## 安装

```sh
# 从 npm（推荐，预构建）
dsh plugin --profile web add dsh-plugin-registry

# 或从 GitHub
dsh plugin --profile web add github:awesome-dsh-plugin/dsh-plugin-registry
```

安装后重启 `dsh web`，然后直接对 agent 说：

- 「帮我找一个微信通知的插件」
- 「有什么终端 TUI 插件？」
- 「安装 dsh-pet」

agent 会依次调用 `search_dsh_plugins` 检索、`install_dsh_plugin` 安装。所有插件均为第三方代码，安装前 agent 会先向你确认。

## 工作原理

- 检索：拉取 `plugins.json`（内存缓存 1 小时，失败回退内置快照），对 `name` + 双语 `description` 做大小写不敏感多关键词匹配，可选按 11 个分类过滤，按名称匹配度排序。
- 安装：从 `ctx.loader` 定位当前 profile 的 `cordis.patch.yml` 所在目录，用 `corepack pnpm add <spec>` 装包（`<spec>` 取自 registry 的 `install` 字段，天然覆盖 npm 名、`github:owner/repo`、monorepo 的 `#path:/sub`），再追加 `insert` 块启用；HMR 监视器自动热加载。
- 可视化页面：客户端 bundle（`dsh.client`）在 Web 设置页注册 `settings.section` 分区，搜索/安装通过宿主自注册的 HTTP 接口 `GET/POST /api/dsh-plugin-registry/*` 复用上述同一套 `registry.ts`/`install.ts` 逻辑。

## 开发

```sh
# 安装依赖
pnpm install

# 编译 TypeScript 到 lib/，并打包客户端 bundle 到 lib/client.js
pnpm build

# 把本地包按名链接进 web profile（pnpm add 本地目录 → 符号链接）
dsh plugin --profile web add .

# 启动（无需 --patch）
dsh web
```

- 客户端 bundle 由 `dsh-client-modules` 按**包名**从 profile 的 `node_modules` 解析（`require.resolve("dsh-plugin-registry/package.json")`），所以必须用 `dsh plugin add .` 让本包可解析；`--patch`（`dev.cordis.patch.yml`）只能加载宿主侧（工具 + HTTP 路由），不会触发 Web UI。
- 改 `client/client.tsx` 后执行 `pnpm build`，HMR 会按 rev 重载 bundle；改 `src/` 后重启 `dsh web`。

## 许可

MIT
