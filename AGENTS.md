# 仓库指南

## 项目结构与模块组织

本仓库是一个基于 React Router 7 + React 19 + TypeScript 的后台管理前端项目。应用代码位于 `app/` 目录下。

* `app/routes/`：页面路由，例如 `login.tsx`、`users.tsx`、`monitor.tsx` 以及图谱管理相关页面
* `app/services/`：按业务域划分的 API 封装，例如 `auth.ts`、`user.ts`、`graph.ts`、`monitor.ts`
* `app/types/`：用于接口数据与页面数据的共享 TypeScript 类型
* `app/stores/`：Zustand 状态管理，例如认证信息与布局状态
* `app/components/`：可复用 UI 组件
* `app/utils/`：工具函数，例如本地存储封装
* `public/`：静态资源，例如 `favicon.ico`

## 构建、测试与开发命令

* `npm run dev`：启动本地开发服务器（React Router 开发模式）
* `npm run typecheck`：生成路由类型并执行 TypeScript 校验
* `npm run build`：构建用于生产环境的客户端与服务端包
* `npm run start`：运行生产构建（`build/server/index.js`）

在提交 PR 之前，请执行 `npm run typecheck && npm run build`。

## 代码风格与命名规范

使用 TypeScript 与函数式 React 组件。遵循现有结构：路由文件使用 kebab-case（如 `graph-visual.tsx`），service/type/store 文件按业务域命名（如 `monitor.ts`、`auth-store.ts`），组件导出名称使用 PascalCase。

建议：

* JSX/TSX 使用仓库中已有的 2 空格缩进格式
* 对非显而易见的逻辑添加简洁的中文注释
* 使用 `apply_patch` 进行手动代码修改
* 使用 `rg` 进行文件/文本搜索

注释应简短并聚焦于意图，不要添加逐行的冗余注释。

## 测试指南

当前尚未配置专门的测试框架。当前必须执行以下验证：

* `npm run typecheck`
* `npm run build`

当后续引入测试时，请将测试文件放在功能附近或单独的测试目录中，并以对应功能命名。

## 提交与 Pull Request 指南

最近的提交历史使用简化的约定式前缀：

* `feat: 用户管理`
* `feat: 图谱管理`
* `style: 增加注释`

请遵循该规范：`feat: ...`、`fix: ...`、`style: ...`、`docs: ...`。

PR 需包含：

* 用户可见变更的简要说明
* 影响的路由或模块
* 本地执行的验证步骤
* UI 变更截图（尤其是 dashboard、图谱和监控页面）

## 安全与配置提示

将 API 地址配置在环境变量中，例如 `VITE_API_BASE_URL` 和 `VITE_PROXY_TARGET`。不要提交任何敏感信息。在开发环境中，请先检查 `vite.config.ts` 中的代理配置，再判断是否为后端问题。
