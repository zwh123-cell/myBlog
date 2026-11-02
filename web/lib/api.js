import { getAccessToken } from "@/lib/auth";

// 服务端渲染优先使用 API_BASE_URL（Docker 内为 http://server:8080），
// 客户端请求使用 NEXT_PUBLIC_API_BASE_URL（浏览器访问宿主机的 localhost）。
const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

/**
 * 获取已发布文章列表
 */
export async function getArticles() {
  const res = await fetch(`${API_BASE_URL}/api/v1/articles`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }

  const json = await res.json();
  return json.data ?? [];
}

/**
 * 统一请求封装：拼接基础地址、设置 JSON 头、解析统一响应结构。
 * 后端约定 code === 0 表示成功，非 0 时抛出携带 message 的异常。
 */
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || `请求失败: ${json.code}`);
  }
  return json.data;
}

/**
 * 用户注册。
 */
export async function register(data) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * 用户登录，成功后返回 { accessToken, refreshToken, user }。
 */
export async function login(data) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * 刷新访问令牌。
 */
export async function refresh(refreshToken) {
  return request("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * 用户登出，使刷新令牌失效。
 */
export async function logout(refreshToken) {
  return request("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * 携带访问令牌发起需认证的请求，自动注入 Authorization 头。
 */
export async function authFetch(path, options = {}) {
  const accessToken = getAccessToken();
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

/**
 * 按 slug 获取已发布文章详情。
 */
export async function getArticleBySlug(slug) {
  return request(`/api/v1/articles/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
}

/**
 * 发布文章或保存草稿（需登录）。
 */
export async function createArticle(data) {
  return authFetch("/api/v1/articles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * 作者编辑自己的文章（需登录）。
 */
export async function updateArticle(id, data) {
  return authFetch(`/api/v1/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * 作者删除自己的文章（需登录）。
 */
export async function deleteArticle(id) {
  return authFetch(`/api/v1/articles/${id}`, {
    method: "DELETE",
  });
}

/**
 * 作者加载自己的文章原始内容（含草稿），用于编辑回显（需登录）。
 */
export async function getArticleRaw(id) {
  return authFetch(`/api/v1/articles/${id}/raw`);
}
