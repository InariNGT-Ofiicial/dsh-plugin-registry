// 客户端 bundle 构建脚本：用 esbuild 把 client/client.tsx 打包成 lib/client.js。
// 产物被包装成 DSH web shell 的模块加载格式（window.__ModuleLoader__.load），
// 由 scripts/build-client.mjs 在 pnpm build 中于 tsc 之后执行。

import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

// 确保 lib 目录存在（tsc 已生成，这里兜底）。
mkdirSync('lib', { recursive: true })

// banner：模块加载器包装头，声明模块 id 与 factory，内部模拟 CommonJS 的 module/exports。
const banner = [
  'window.__ModuleLoader__.load({',
  '  id: "dsh-plugin-registry",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  '    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
].join('\n') + '\n'

// footer：结束 factory 并返回模块导出，与 banner 闭合配对。
const footer = '\n    return module.exports;\n  },\n});\n'

await build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  format: 'cjs',
  jsx: 'automatic',
  platform: 'browser',
  target: 'es2020',
  // react 与 react/jsx-runtime 由 DSH web shell 提供，标记为外部依赖不打包。
  external: ['react', 'react/jsx-runtime'],
  banner: { js: banner },
  footer: { js: footer },
  outfile: 'lib/client.js',
  sourcemap: false,
  logLevel: 'info',
})
