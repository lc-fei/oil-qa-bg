import type { Route } from "./+types/roles";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "角色权限 | 油井工程智能问答系统" }];
}

export default function RolesPage() {
  return (
    <PagePlaceholder
      title="角色权限"
      description="这里预留角色列表、角色编辑弹窗和权限树配置区域，后续可按需求分析文档继续细化。"
    />
  );
}
