// 登录态管理：负责访问令牌与刷新令牌的本地存储、读取与清除。
// 仅可在客户端使用（依赖浏览器 localStorage）。

const ACCESS_TOKEN_KEY = "boke_access_token";
const REFRESH_TOKEN_KEY = "boke_refresh_token";
const CURRENT_USER_KEY = "boke_current_user";

/**
 * 判断当前是否运行在浏览器环境。
 */
function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * 获取访问令牌，非浏览器环境返回 null。
 */
export function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 获取刷新令牌，非浏览器环境返回 null。
 */
export function getRefreshToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 保存访问令牌与刷新令牌。
 */
export function setTokens(accessToken, refreshToken) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * 清除本地保存的令牌。
 */
export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * 保存当前登录用户信息，供前端判断文章归属等 UI 场景使用。
 */
export function setCurrentUser(user) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

/**
 * 获取当前登录用户信息，未登录或解析失败时返回 null。
 */
export function getCurrentUser() {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 判断是否已登录（是否存在访问令牌）。
 */
export function isLoggedIn() {
  return Boolean(getAccessToken());
}
