import type { Route } from "./+types/users";
import { PagePlaceholder } from "../components/page-placeholder";

export function meta({}: Route.MetaArgs) {
  return [{ title: "用户管理 | 油井工程智能问答系统" }];
}

export default function UsersPage() {
  return (
    <PagePlaceholder
      title="用户管理"
      description="已接入后台框架路由，后续可以在此页面补充搜索表单、用户表格、新增编辑抽屉和启停操作。"
    />
  );
}
