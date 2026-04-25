import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { clearStorage, readStorage, AUTH_STORAGE_KEY } from "../utils/storage";

interface AuthSnapshot {
  token: string;
}

let authRedirecting = false;

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 15000,
});

function redirectToLoginWhenAuthExpired() {
  clearStorage(AUTH_STORAGE_KEY);

  if (typeof window === "undefined" || authRedirecting) {
    return;
  }

  authRedirecting = true;

  // token 失效属于全局登录态问题，直接回登录页，避免各页面只弹 toast 后停留在失效状态。
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = readStorage<AuthSnapshot>(AUTH_STORAGE_KEY);

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;

    if (payload?.code && payload.code !== 200) {
      if (payload.code === 401) {
        redirectToLoginWhenAuthExpired();
      }

      return Promise.reject(new Error(payload.message || "请求失败"));
    }

    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (status === 401) {
      redirectToLoginWhenAuthExpired();
    }

    const message =
      error.response?.data?.message || error.message || "网络异常，请稍后重试";

    return Promise.reject(new Error(message));
  },
);
