import type { Route } from "./+types/graph-visual";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱可视化 | 油井工程智能问答系统" }];
}

export default function GraphVisualPage() {
  return (
    <PagePlaceholder
      title="图谱可视化"
      description="这里预留左侧过滤区、中间图谱画布和右侧节点详情区，后续接入 React Flow 即可扩展为可交互图谱页面。"
    />
  );
}
