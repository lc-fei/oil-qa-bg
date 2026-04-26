import type { ApiResponse } from "../types/auth";
import type {
  PageResult,
  RoleOption,
  UserDetail,
  UserListItem,
  UserListQuery,
  UserPayload,
  UserStatusPayload,
} from "../types/user";
import { request } from "./request";

// 用户列表接口承载筛选和分页参数，是用户管理页表格的唯一数据源。
export async function getUserList(params: UserListQuery) {
  const response = await request.get<ApiResponse<PageResult<UserListItem>>>(
    "/api/admin/users",
    { params },
  );

  return response.data.data;
}

// 编辑抽屉需要完整用户资料，因此通过详情接口回填角色、联系方式和状态。
export async function getUserDetail(id: number) {
  const response = await request.get<ApiResponse<UserDetail>>(`/api/admin/users/${id}`);

  return response.data.data;
}

// 新增用户接口提交账号、密码、角色和启停状态等后台管理字段。
export async function createUser(payload: UserPayload) {
  const response = await request.post<ApiResponse<boolean>>("/api/admin/users", payload);

  return response.data.data;
}

// 更新用户接口复用新增表单结构，调用方负责在提交前完成字段规范化。
export async function updateUser(id: number, payload: UserPayload) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/users/${id}`,
    payload,
  );

  return response.data.data;
}

// 启停用户使用独立接口，避免状态切换时误覆盖用户的其他资料字段。
export async function updateUserStatus(id: number, payload: UserStatusPayload) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/users/${id}/status`,
    payload,
  );

  return response.data.data;
}

// 删除用户是高风险管理操作，页面层通过 Popconfirm 先做人工确认。
export async function deleteUser(id: number) {
  const response = await request.delete<ApiResponse<boolean>>(`/api/admin/users/${id}`);

  return response.data.data;
}

// 角色选项用于用户编辑时配置权限，当前角色管理不再作为独立页面展示。
export async function getRoleOptions() {
  const response = await request.get<ApiResponse<RoleOption[]>>("/api/admin/roles");

  return response.data.data;
}
