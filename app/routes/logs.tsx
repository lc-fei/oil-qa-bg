import type { Route } from "./+types/logs";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "异常日志 | 油井工程智能问答系统" }];
}

export default function LogsPage() {
  return (
    <PagePlaceholder
      title="异常日志"
      description="这里预留异常筛选、日志表格和详情抽屉。后续可接入分页查询和按模块、时间范围检索。"
    />
  );
}
