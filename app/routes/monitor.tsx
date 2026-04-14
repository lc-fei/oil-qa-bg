import type { Route } from "./+types/monitor";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "运行监控 | 油井工程智能问答系统" }];
}

export default function MonitorPage() {
  return (
    <PagePlaceholder
      title="运行监控"
      description="这里可继续拆分为运行总览、请求列表、链路详情、AI 调用记录等子视图。当前先保留主路由和页面容器。"
    />
  );
}
