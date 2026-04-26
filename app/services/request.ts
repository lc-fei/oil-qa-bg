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

// request 实例统一承载 baseURL、超时、鉴权头和业务错误处理，页面层只关心 data。
export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  timeout: 15000,
});

// 认证失效会影响整个后台，集中跳转可以避免每个页面自行处理 401。
function redirectToLoginWhenAuthExpired() {
  clearStorage(AUTH_STORAGE_KEY);

  // SSR 或已经触发跳转时直接返回，防止重复 replace 导致路由抖动。
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

  // 所有受保护接口都依赖 Bearer token，通过拦截器统一注入避免调用方遗漏。
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;

    if (payload?.code && payload.code !== 200) {
      // 部分后端会用 HTTP 200 包业务 code=401，这里与标准 HTTP 401 做同等处理。
      if (payload.code === 401) {
        redirectToLoginWhenAuthExpired();
      }

      return Promise.reject(new Error(payload.message || "请求失败"));
    }

    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // 标准 HTTP 401 直接回登录页，避免 token 过期后仅弹错误提示。
    if (status === 401) {
      redirectToLoginWhenAuthExpired();
    }

    const message =
      error.response?.data?.message || error.message || "网络异常，请稍后重试";

    return Promise.reject(new Error(message));
  },
);
