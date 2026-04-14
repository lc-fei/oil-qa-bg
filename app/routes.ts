import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("users", "routes/users.tsx"),
    route("graph/entities", "routes/graph-entities.tsx"),
    route("graph/visual", "routes/graph-visual.tsx"),
    route("monitor", "routes/monitor.tsx"),
    route("logs", "routes/logs.tsx"),
  ]),
] satisfies RouteConfig;
