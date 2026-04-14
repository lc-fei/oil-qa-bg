export const AUTH_STORAGE_KEY = "oil-qa-admin-auth";

export function canUseDOM() {
  return typeof window !== "undefined";
}

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

export function writeStorage<T>(key: string, value: T) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearStorage(key: string) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.removeItem(key);
}
