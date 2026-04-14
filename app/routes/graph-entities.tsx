import type { Route } from "./+types/graph-entities";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "图谱实体管理 | 油井工程智能问答系统" }];
}

export default function GraphEntitiesPage() {
  return (
    <PagePlaceholder
      title="图谱实体管理"
      description="页面已进入后台菜单体系，后续可以继续扩展实体搜索表单、表格、编辑抽屉和删除确认流程。"
    />
  );
}
