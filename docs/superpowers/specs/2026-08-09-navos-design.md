# NavOS 网址导航系统设计文档

-   日期：2026-08-09
-   状态：已批准（用户确认）
-   部署目标：Cloudflare（用户已有账号）

## 1、项目目标

构建一个 Apple 设计语言（Apple Design Language）风格的现代化网址导航系统，融合
macOS Launchpad、iOS App Library 和 Safari 起始页的设计理念，并完整部署到
Cloudflare 平台。

首版交付范围：规划文档的 Phase 1 + Phase 2（登录、网站/分类管理、后台管理、
首页展示、Apple 风动画、拖拽排序、深色模式、PWA）。Phase 3 的 AI 分类、浏览器
插件、数据同步留到后续迭代，`ai_tasks` 表预建结构。

## 2、技术架构

### 2.1 选型依据

2026 年 Cloudflare 官方推荐路径为 `@opennextjs/cloudflare`（next-on-pages 已退役）。
该适配器将 Next.js 构建产物转换为 Workers 可运行格式，运行在
Workers 的 Node.js 兼容运行时（`nodejs_compat`），完整支持 App Router、
Route Handlers、Server Actions、中间件、SSR。

### 2.2 技术栈

-   **框架：** Next.js 16（App Router）+ React + TypeScript
-   **样式：** Tailwind CSS + shadcn/ui
-   **动画：** Framer Motion
-   **拖拽：** dnd-kit
-   **数据库：** Cloudflare D1（SQLite）+ Drizzle ORM
-   **认证：** Better Auth（Drizzle adapter，provider: sqlite）+ KV 会话次级存储
-   **部署：** Wrangler → Cloudflare Workers

### 2.3 基础设施清单（免费额度内）

| 资源 | 用途 | 绑定名 |
|------|------|--------|
| D1 数据库 | 业务数据 + Auth 表 | DB |
| KV | Better Auth session 次级存储 | SESSION_KV |
| Workers | 应用本身 | navos |

免费额度：Workers 每日 100k 请求，D1 每日 5 GB 存储与 500 万行读取，
个人项目足够。

## 3、数据模型（D1 + Drizzle）

### 3.1 Better Auth 自带表

由 `@better-auth/cli` 生成 schema：`user`、`account`、`session`、`verification`
（Drizzle migration 统一管理）。`role` 列直接追加在 `user` 表上，
不与业务表重复定义用户。

由 `@better-auth/cli` 生成 schema：`user`、`account`、`session`、`verification`
（Drizzle migration 统一管理）。

### 3.2 业务表（对应规划中的 12 张表）

| 表名 | 关键字段 | 说明 |
|------|----------|------|
| user_preferences | user_id，theme，layout | 深色模式偏好、布局设置 |
| websites | id，user_id，category_id，title，url，description，icon_url，sort_order，created_at | 网站条目，外键关联用户与分类 |
| categories | id，user_id，name，icon，color，sort_order | 分类，支持自定义图标与颜色 |
| tags | id, user_id，name | 标签 |
| website_tags | website_id，tag_id | 多对多关联 |
| favorites | user_id，website_id，created_at | 收藏，唯一约束 (user_id, website_id) |
| visit_logs | user_id，website_id，visited_at | 最近访问记录，冗余存 website_id 快照 |
| search_logs | user_id，query，created_at | 搜索记录 |
| admin_logs | user_id，action，target_type，target_id，detail，created_at | 管理操作审计 |
| system_settings | key, value | 系统级设置 |
| ai_tasks | user_id, status, type, payload, result, created_at | 预建，Phase 3 使用 |

关系：User 1→N Favorite → Website；Category 1→N Website；
Website N→M Tag（经 website_tags）。

首版所有数据按 user_id 隔离（单用户部署时也可用，天然支持后续多用户）。

### 3.3 兜底说明

websites 表同时存 title/description 快照，便于后台表格直接展示，不做每次
join 抓取。图标 icon_url 首版使用 Google favicon 服务的 URL 约定
（`https://www.google.com/s2/favicons?domain=<域名>&sz=64`）由客户端生成，
不引入服务端 DOM 解析库。

## 4、认证设计

-   库：Better Auth，支持邮箱密码登录，首版不接 OAuth。
-   会话：存储在 D1，次级存储（KV）加速；cookie 名 `navos_session`。
-   角色：users 表附加列 `role`（admin / editor / user），首版仅有 admin。
  编辑器（editor）与普通用户（user）角色预留给 Phase 3。
- 注册策略：首版开放注册，首个注册用户自动成为 admin（在注册回调中检查
  user 表是否为空），后续注册默认 user 角色。可通过 system_settings 关闭开放注册。

## 5、路由与页面设计

### 5.1 App Router 结构

```
src/app/
├── layout.tsx            # 全局布局（字体、主题 Provider）
├── page.tsx              # 首页（搜索、分类标签、网站卡片）
├── login/page.tsx        # 登录页
├── register/page.tsx     # 注册页
├── admin/layout.tsx      # 后台布局（侧边栏，中间件鉴权）
├── admin/page.tsx        # Dashboard：网站/分类数量、访问统计
├── admin/websites/page.tsx    # 网站管理（增删改、排序、批量导入）
├── admin/categories/page.tsx  # 分类管理（创建、拖拽排序、图标颜色）
├── admin/users/page.tsx       # 用户管理（admin 角色）
├── api/[...all]/route.ts       # Better Auth 处理
└── api/websites/route.ts       # 预留（插件/第三方调用），首版不实现
```

业务逻辑优先使用 Server Actions，需要公开 API 的场景（浏览器插件预留、
favicon 代理）才暴露 Route Handler，全部路由禁用 `runtime = 'edge'`。

### 5.2 首页交互

-   搜索：本地过滤 + 搜索历史记录到 search_logs。
- 分类标签：横向滚动 Tab，激活分类过滤卡片。
- 网站卡片：毛玻璃卡片（backdrop-blur），显示 favicon、标题、描述，
  点击新标签页打开。
- 收藏与最近访问：登录用户展示「收藏」「最近」分组。
- 深色模式：next-themes，默认跟随系统。

### 5.3 后台页面

- **Dashboard：**网站数、分类数、今日访问数（visit_logs 按日聚合）。
- **网站管理：**表格 + 弹窗表单，支持批量导入（textarea 每行一 URL）。
- **分类管理：**卡片列表，dnd-kit 拖拽排序，图标与颜色选择器。
- **用户管理：**列表，禁用/启用，改角色（仅 admin）。

## 6、UI 设计规范

- 字体：系统字体栈：`-apple-system, SF Pro Text, Segoe UI, Roboto,
  PingFang SC, Microsoft YaHei`（首版不发字体文件，减少打包体积）。
- 毛玻璃：白底 `bg-white/70 backdrop-blur-xl`，深色 `bg-black/40`。
- 圆角：大圆角（卡片 20 - 24 px，按钮 999 px 胶囊）。
- 动画：Framer Motion spring 动画，卡片入场 stagger、悬停 scale。
- 支持深色模式：`next-themes`。
- 无障碍：键盘导航可触达所有卡片。

## 7、部署设计

### 7.1 文件清单

- `wrangler.jsonc`：main `.open-next/worker.js`，绑定 DB（D1）、SESSION（KV），
  `compatibility_flags: ["nodejs_compat"]`，assets 指向 `.open-next/assets`。
- `open-next.config.ts`：本系统全动态渲染，不配置 ISR 三件套。
- `next.config.ts`：`images` 自定义 loader 指向 `/cdn-cgi/image/`，
  `output` 保持默认（standalone 交给 OpenNext）。
- package.json 脚本:
  - `dev`: `next dev`
  - `build`: `next build`
  - `preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview`
  - `deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy`
  - `cf-typegen`: `wrangler types --env-interface CloudflareEnv env.d.ts`
  - `db:generate` / `db:migrate`: Drizzle Kit 迁移

### 7.2 环境变量规范

-   构建时注入：`NEXT_PUBLIC_*`（无首版）。
- 运行时：`BETTER_AUTH_SECRET`（`wrangler secret put`）、D1/KV 绑定。
- 本地开发：`.dev.vars` 放 `BETTER_AUTH_SECRET`，wrangler 自动加载。
- 不用 `.env` 在线上传递环境变量（线上不生效）。

### 7.3 已知坑规避（2026 现状）

1. 全局搜索并删除 `export const runtime = 'edge'`，该声明会让路由静默消失。
2. 依赖只选 ESM-only、无 DOM 依赖的包。
3. 首页响应尽量避免 set-cookie（个性化均走 Server Action 后客户端更新），
   保证 CDN 边缘缓存命中；动态数据直接 SSR。
4. `next/image` 使用自定义 loader 走 Cloudflare 边缘图片服务。
5. 部署流程：`npm run preview` 本地 workerd 验证 → `npm run deploy`。

## 8、测试策略

- 单元测试：核心逻辑（排序、导入解析、auth 角色分配）用 Vitest。
- 集成测试：D1 迁移验证（`drizzle-kit migrate` 后在本地 wrangler 环境执行冒烟查询）。
- E2E：Playwright 冒烟（登录 → 添加网站 → 首页可见 → 收藏），
  在 `preview` 环境跑。
- 每次改动必须 `npm run typecheck` 与 `npm run lint` 通过。

## 9、开发阶段（含验收点）

| 阶段 | 内容 | 验收点 |
|------|------|--------|
| P1 基建 | 项目初始化、Tailwind/shadcn、D1+Drizzle 表、认证登录注册 | 本地登录成功，数据持久化 |
| P2 前台 | 首页卡片、搜索、分类标签、收藏、最近访问、深色模式 | UI 可交付，数据读写正确 |
| P3 后台 | Dashboard、网站管理、分类拖拽、用户管理、导入导出 | 管理端全功能可用 |
| P4 部署 | wrangler 配置、deploy、自定义域名、PWA、README | 线上可访问，workers.dev 正常 |

每阶段以 TypeScript 类型与 lint 通过为默认门禁，P4 以线上 URL 为完成标准。

## 10、明确不做的事（YAGNI）

- Phase 3 的 AI 分类、浏览器插件、数据同步（表结构已预留）。
- 图片上传（R2）——首版只用 favicon URL。
- 多主题自定义配色——只做亮/暗两套。
- OAuth 登录（GitHub/Google）——邮箱密码足够，后续可加。