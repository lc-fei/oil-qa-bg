import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

// 路由表把登录页和受保护后台布局分开，所有管理端业务页都挂在 app-layout 下。
export default [
  route("login", "routes/login.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("users", "routes/users.tsx"),
    route("graph/entities", "routes/graph-entities.tsx"),
    route("graph/relations", "routes/graph-relations.tsx"),
    route("graph/types", "routes/graph-types.tsx"),
    route("graph/import", "routes/graph-import.tsx"),
    route("graph/versions", "routes/graph-versions.tsx"),
    route("graph/visual", "routes/graph-visual.tsx"),
    route("monitor", "routes/monitor.tsx"),
  ]),
] satisfies RouteConfig;
