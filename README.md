# NavOS 网址导航

基于 Next.js (App Router) + Cloudflare D1/KV + Better Auth + Drizzle 的网址导航系统，支持后台管理、分类拖拽排序、批量导入与 PWA 离线安装。

## 技术栈

- **框架**: Next.js 16 (App Router) + Tailwind CSS v4
- **运行时**: Cloudflare Workers（[OpenNext](https://opennext.js.org/cloudflare)）
- **存储**: Cloudflare D1 (SQLite) + KV（会话存储）
- **认证**: Better Auth（邮箱密码登录，首个注册用户自动成为管理员）
- **ORM**: Drizzle + drizzle-kit 迁移
- **测试**: Playwright E2E（Edge 通道）、Vitest 单元测试

## 本地开发

```bash
npm install
npx wrangler d1 create navos          # 云端 D1（本地开发可跳过）
npx wrangler d1 migrations apply navos --local
npm run dev                           # http://localhost:3000
```

> 本地开发建议直接访问 `http://localhost:3000`（127.0.0.1 也已通过 `allowedDevOrigins` 放行）。
> 首个注册的账号自动成为管理员，可访问 `/admin` 后台。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run preview` | 本地以 Cloudflare runtime 预览（需先 build） |
| `npm run deploy` | 部署到 Cloudflare |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | Vitest 单元测试 |
| `npm run build` | OpenNext 生产构建 |
| `npm run e2e` | Playwright E2E 测试 |
| `npm run e2e:reset` | 清空本地 D1 用户数据（E2E 前置步骤） |

## E2E 测试

E2E 假定**空库首用户为管理员**，因此每次运行前需重置本地数据：

```bash
# 先停止 npm run dev，再执行：
npm run e2e:reset

# 重新启动 dev server 后运行：
npm run e2e
```

测试按文件名顺序串行执行（`00-smoke` 注册首个管理员并完成创建分类/导入网址冒烟，`01-login` 验证已有账号登录）。浏览器使用系统 Edge（`channel: "msedge"`），通过 `E2E_BASE_URL` 环境变量可覆盖目标地址。

## 数据库迁移

```bash
npm run db:generate   # 根据 schema 生成迁移
npx wrangler d1 migrations apply navos --local    # 应用到本地
npx wrangler d1 migrations apply navos --remote   # 应用到生产
```
