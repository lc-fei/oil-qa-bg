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

const initialState = readStorage<PersistedAuthState>(AUTH_STORAGE_KEY);

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialState?.token ?? null,
  tokenType: initialState?.tokenType ?? "Bearer",
  expiresIn: initialState?.expiresIn ?? 0,
  userInfo: initialState?.userInfo ?? null,
  initialized: false,
  isAuthenticated: Boolean(initialState?.token),
  bootstrap: async () => {
    if (get().initialized) {
      return;
    }

    const current = readStorage<PersistedAuthState>(AUTH_STORAGE_KEY);

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
      if (get().token) {
        await logoutService();
      }
    } catch {
      // Ignore logout request errors and clear local state anyway.
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
