export const AUTH_STORAGE_KEY = "oil-qa-admin-auth";

// SSR 构建阶段没有 window，需要先判断再访问浏览器存储。
export function canUseDOM() {
  return typeof window !== "undefined";
}

// 读取本地缓存时统一做 JSON 解析，损坏数据会被清理以避免登录态卡死。
export function readStorage<T>(key: string): T | null {
  if (!canUseDOM()) {
    return null;
  }

  const value = window.localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

// 写入前统一序列化，保证 auth-store 和请求拦截器读取同一份结构。
export function writeStorage<T>(key: string, value: T) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

// 清理函数集中封装，便于 token 失效、退出登录等场景复用。
export function clearStorage(key: string) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.removeItem(key);
}
