import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('lib', { recursive: true })

const banner = [
  'window.__ModuleLoader__.load({',
  '  id: "dsh-plugin-registry",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  '    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
].join('\n') + '\n'

const footer = '\n    return module.exports;\n  },\n});\n'

await build({
  entryPoints: ['client/client.tsx'],
  bundle: true,
  format: 'cjs',
  jsx: 'automatic',
  platform: 'browser',
  target: 'es2020',
  external: ['react', 'react/jsx-runtime'],
  banner: { js: banner },
  footer: { js: footer },
  outfile: 'lib/client.js',
  sourcemap: false,
  logLevel: 'info',
})
