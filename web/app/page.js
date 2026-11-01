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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="py-10 text-center sm:py-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          我的博客
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          基于 Next.js + Spring Boot + MySQL 的轻量级博客
        </p>
      </section>

      {error ? (
        <div className="card p-6 text-center text-amber-700">{error}</div>
      ) : articles.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-medium text-slate-500">暂无文章</p>
          <p className="mt-2 text-sm text-slate-400">
            后续文章发布后会自动显示在这里
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="card p-6 transition hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {article.title}
              </h2>
              {article.summary && (
                <p className="mt-2 text-slate-600">{article.summary}</p>
              )}
              {article.publishedAt && (
                <p className="mt-4 text-sm text-slate-400">
                  {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
