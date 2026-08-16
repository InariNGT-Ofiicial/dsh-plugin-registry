import { registerRoutes } from './api.js';
import { ProfileStore } from './profile.js';
import { registerTools } from './tools.js';
// 插件元信息：cordis 通过 name 标识插件，inject 声明依赖的服务。
export const name = 'dsh-plugin-registry';
// 依赖 DSH 的「工具」服务（注册 agent 工具）与「加载器」（读取 loader 配置）。
export const inject = ['tools', 'loader'];
/**
 * 插件入口：cordis 在加载插件时调用。
 * 作为唯一的服务装配点，把 ProfileStore 同时喂给 DSH 工具与 HTTP API，
 * 保证两边读到的是同一份安装状态。
 */
export function apply(ctx) {
    // 唯一的服务入口：HTTP API 与 DSH 工具共享同一 ProfileStore，
    // 安装状态以 profile 依赖为唯一事实源。
    const profile = new ProfileStore(ctx);
    // 注册面向 agent 的两个工具：search_dsh_plugins / install_dsh_plugin。
    registerTools(ctx, profile);
    // HTTP 路由仅在有 webServer 的 profile 中注册；无头 profile 下该子协程保持 PENDING。
    ctx.inject(['webServer'], (wctx) => {
        registerRoutes(wctx.webServer, profile);
    });
}
