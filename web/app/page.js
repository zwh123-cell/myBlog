import { getArticles } from "@/lib/api";

// 强制动态渲染，避免构建时因后端未启动而失败
export const dynamic = "force-dynamic";

export default async function Home() {
  let articles = [];
  let error = null;

  try {
    articles = await getArticles();
  } catch (e) {
    error = "后端服务未启动或不可用";
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">我的博客</h1>
        <p className="mt-2 text-gray-600">
          基于 Next.js + Spring Boot + MySQL 的轻量级博客
        </p>

        {error ? (
          <p className="mt-8 rounded-lg bg-amber-50 p-4 text-amber-700">
            {error}
          </p>
        ) : articles.length === 0 ? (
          <p className="mt-8 rounded-lg bg-white p-6 text-gray-500 shadow-sm">
            暂无文章
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {articles.map((article) => (
              <li
                key={article.id}
                className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="mt-2 text-gray-600">{article.summary}</p>
                )}
                {article.publishedAt && (
                  <p className="mt-3 text-sm text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
