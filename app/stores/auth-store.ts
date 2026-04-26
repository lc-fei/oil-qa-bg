import { create } from "zustand";

import { getCurrentUser, login as loginService, logout as logoutService } from "../services/auth";
import type { LoginPayload, UserInfo } from "../types/auth";
import {
  AUTH_STORAGE_KEY,
  clearStorage,
  readStorage,
  writeStorage,
} from "../utils/storage";

interface AuthState {
  token: string | null;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfo | null;
  initialized: boolean;
  isAuthenticated: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

interface PersistedAuthState {
  token: string;
  tokenType: string;
  expiresIn: number;
  userInfo: UserInfo;
}

// store 初始化时先读取本地缓存，让刷新页面后仍能保持已登录外观。
const initialState = readStorage<PersistedAuthState>(AUTH_STORAGE_KEY);

// 认证 store 同时维护内存状态和 localStorage，供路由守卫与请求拦截器共享登录态。
export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialState?.token ?? null,
  tokenType: initialState?.tokenType ?? "Bearer",
  expiresIn: initialState?.expiresIn ?? 0,
  userInfo: initialState?.userInfo ?? null,
  initialized: false,
  isAuthenticated: Boolean(initialState?.token),
  bootstrap: async () => {
    // bootstrap 只允许执行一次，避免布局和登录页同时触发重复校验。
    if (get().initialized) {
      return;
    }

    const current = readStorage<PersistedAuthState>(AUTH_STORAGE_KEY);

    // 无 token 时直接结束初始化，让受保护布局负责跳转登录页。
    if (!current?.token) {
      set({ initialized: true, isAuthenticated: false, userInfo: null, token: null });
      return;
    }

    set({
      token: current.token,
      tokenType: current.tokenType,
      expiresIn: current.expiresIn,
      userInfo: current.userInfo,
      isAuthenticated: true,
    });

    try {
      // 使用 /auth/me 校验 token 有效性，同时刷新本地用户信息。
      const userInfo = await getCurrentUser();
      const nextState: PersistedAuthState = {
        ...current,
        userInfo,
      };

      writeStorage(AUTH_STORAGE_KEY, nextState);
      set({
        initialized: true,
        isAuthenticated: true,
        userInfo,
      });
    } catch {
      // token 失效或用户接口失败时必须清空状态，避免继续展示过期后台页面。
      clearStorage(AUTH_STORAGE_KEY);
      set({
        initialized: true,
        isAuthenticated: false,
        token: null,
        userInfo: null,
        expiresIn: 0,
      });
    }
  },
  login: async (payload) => {
    // 登录成功后同时写入本地缓存和内存状态，刷新页面才能恢复会话。
    const data = await loginService(payload);
    const nextState: PersistedAuthState = {
      token: data.token,
      tokenType: data.tokenType,
      expiresIn: data.expiresIn,
      userInfo: data.userInfo,
    };

    writeStorage(AUTH_STORAGE_KEY, nextState);
    set({
      ...nextState,
      initialized: true,
      isAuthenticated: true,
    });
  },
  logout: async () => {
    try {
      // 只有存在 token 时才通知后端退出，避免未登录状态下产生无意义请求。
      if (get().token) {
        await logoutService();
      }
    } catch {
      // 即使后端退出失败，也必须清理本地状态，避免用户无法主动退出。
    } finally {
      clearStorage(AUTH_STORAGE_KEY);
      set({
        token: null,
        tokenType: "Bearer",
        expiresIn: 0,
        userInfo: null,
        initialized: true,
        isAuthenticated: false,
      });
    }
  },
}));
