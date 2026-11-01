const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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
