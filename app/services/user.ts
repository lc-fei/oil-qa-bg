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

export async function getUserList(params: UserListQuery) {
  const response = await request.get<ApiResponse<PageResult<UserListItem>>>(
    "/api/admin/users",
    { params },
  );

  return response.data.data;
}

export async function getUserDetail(id: number) {
  const response = await request.get<ApiResponse<UserDetail>>(`/api/admin/users/${id}`);

  return response.data.data;
}

export async function createUser(payload: UserPayload) {
  const response = await request.post<ApiResponse<boolean>>("/api/admin/users", payload);

  return response.data.data;
}

export async function updateUser(id: number, payload: UserPayload) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/users/${id}`,
    payload,
  );

  return response.data.data;
}

export async function updateUserStatus(id: number, payload: UserStatusPayload) {
  const response = await request.put<ApiResponse<boolean>>(
    `/api/admin/users/${id}/status`,
    payload,
  );

  return response.data.data;
}

export async function deleteUser(id: number) {
  const response = await request.delete<ApiResponse<boolean>>(`/api/admin/users/${id}`);

  return response.data.data;
}

export async function getRoleOptions() {
  const response = await request.get<ApiResponse<RoleOption[]>>("/api/admin/roles");

  return response.data.data;
}
