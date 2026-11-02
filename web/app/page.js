import Link from "next/link";
import { getArticles } from "@/lib/api";
import { estimateReadingMinutes, formatDate } from "@/lib/format";

// 强制动态渲染，避免构建时因后端未启动而失败
export const dynamic = "force-dynamic";

/**
 * 首页：Hero 介绍 + 已发布文章列表。
 * 列表项展示标题、摘要、发布时间与预估阅读时长。
 */
export default async function Home() {
  let articles = [];
  let error = null;

  try {
    articles = await getArticles();
  } catch (e) {
    error = "后端服务未启动或不可用";
  }

  return (
    <main className="page-shell py-10 sm:py-14">
      {/* 顶部 Hero：品牌介绍 + 入口按钮 */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 px-6 py-14 text-center shadow-[0_30px_80px_-45px_rgba(79,70,229,0.45)] backdrop-blur sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="surface-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
        />

        <div className="relative">
          <span className="badge">Next.js · Spring Boot · MySQL</span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            我的<span className="text-gradient">博客</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            记录想法、整理笔记，把零散的思考写成一篇文章。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#articles" className="btn-primary">
              开始阅读
            </a>
            <Link href="/write" className="btn-outline">
              写一篇文章
            </Link>
          </div>

          <p className="mt-6 text-xs tracking-wide text-slate-400">
            共 {articles.length} 篇文章 · 持续更新中
          </p>
        </div>
      </section>

      {/* 文章列表 */}
      <section id="articles" className="mt-12 scroll-mt-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              最新文章
            </h2>
            <p className="mt-1 text-sm text-slate-500">按发布时间倒序排列</p>
          </div>
          <span className="badge shrink-0">{articles.length} 篇</span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-6 py-8 text-center text-sm text-amber-700">
            {error}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <svg
                aria-hidden="true"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 4h8l4 4v12H4V4h4zm0 0v5h8"
                />
              </svg>
            </span>
            <p className="mt-4 text-base font-medium text-slate-600">
              还没有文章
            </p>
            <p className="mt-1 text-sm text-slate-400">
              写下第一篇，让它出现在这里
            </p>
            <Link href="/write" className="btn-primary mt-6">
              开始写作
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {articles.map((article, index) => (
              <li key={article.id}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="card card-hover group relative flex gap-5 overflow-hidden p-5 sm:p-6"
                >
                  {/* 悬停时左侧渐变色条 */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-fuchsia-500 opacity-0 transition duration-300 group-hover:opacity-100"
                  />

                  <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 font-mono text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-200/70 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:ring-indigo-100 sm:flex">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-indigo-600 sm:text-xl">
                        {article.title}
                      </h3>
                      <svg
                        aria-hidden="true"
                        className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 5.5 20 12l-6.5 6.5M4 12h16"
                        />
                      </svg>
                    </div>

                    {article.summary && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 sm:text-[15px]">
                        {article.summary}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <time dateTime={article.publishedAt || undefined}>
                        {formatDate(article.publishedAt)}
                      </time>
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-slate-300"
                      />
                      <span>
                        约 {estimateReadingMinutes(article.content)} 分钟阅读
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
