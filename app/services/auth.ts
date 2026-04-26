import { request } from "./request";
import type { ApiResponse, LoginPayload, LoginResult, UserInfo } from "../types/auth";

// 登录接口负责换取后台访问 token，并返回后续布局展示所需的用户信息。
export async function login(payload: LoginPayload) {
  const response = await request.post<ApiResponse<LoginResult>>(
    "/api/auth/login",
    payload,
  );

  return response.data.data;
}

// 当前用户接口用于启动时校验本地 token 是否仍有效，并刷新用户资料。
export async function getCurrentUser() {
  const response = await request.get<ApiResponse<UserInfo>>("/api/auth/me");

  return response.data.data;
}

// 退出登录接口通知后端失效当前 token，本地清理由 auth-store 兜底完成。
export async function logout() {
  const response = await request.post<ApiResponse<boolean>>("/api/auth/logout");

  return response.data.data;
}
