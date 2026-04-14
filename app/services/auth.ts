import { request } from "./request";
import type { ApiResponse, LoginPayload, LoginResult, UserInfo } from "../types/auth";

export async function login(payload: LoginPayload) {
  const response = await request.post<ApiResponse<LoginResult>>(
    "/api/auth/login",
    payload,
  );

  return response.data.data;
}

export async function getCurrentUser() {
  const response = await request.get<ApiResponse<UserInfo>>("/api/auth/me");

  return response.data.data;
}

export async function logout() {
  const response = await request.post<ApiResponse<boolean>>("/api/auth/logout");

  return response.data.data;
}
