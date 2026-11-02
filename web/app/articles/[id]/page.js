import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug } from "@/lib/api";
import { estimateReadingMinutes, formatDate } from "@/lib/format";
import ArticleOwnerActions from "./ArticleOwnerActions";

// 强制动态渲染，避免构建时因后端未启动而失败
export const dynamic = "force-dynamic";

/**
 * 取作者头像占位文字：昵称首字符。
 */
function getAvatarText(name) {
  return (name || "匿").trim().slice(0, 1).toUpperCase();
}

/**
 * 文章详情页：展示标题、作者、发布时间与 Markdown 渲染后的正文。
 *
 * 注意：Next.js 要求同一路径层级使用统一的动态段名，故详情页与编辑页共用 [id]；
 * 详情页的公开 URL 使用 slug，因此此处 params.id 实际承载的是文章 slug。
 */
export default async function ArticleDetailPage({ params }) {
  const slug = params.id;
  let article = null;
  let error = null;

  try {
    article = await getArticleBySlug(slug);
  } catch (e) {
    error = e.message || "文章不存在";
  }

  if (!article) {
    return (
      <main className="page-narrow flex min-h-[60vh] items-center py-16">
        <div className="card w-full p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 font-mono text-lg font-bold text-slate-300">
            404
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            文章不存在
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "该文章可能已被删除或尚未发布"}
          </p>
          <Link href="/" className="btn-primary mt-8">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const authorName = article.authorNickname || "匿名作者";

  return (
    <main className="page-narrow py-10 sm:py-14">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4 transition group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 5.5 4 12l6.5 6.5M20 12H4"
          />
        </svg>
        返回首页
      </Link>

      <article className="mt-6 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
        {/* 文章头部：标题 + 作者信息 */}
        <header className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-50/80 via-white to-fuchsia-50/60 px-6 py-10 sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl"
          />

          <div className="relative">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/20">
                  {getAvatarText(authorName)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {authorName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {article.publishedAt && (
                      <>
                        <time dateTime={article.publishedAt}>
                          {formatDate(article.publishedAt)}
                        </time>
                        <span aria-hidden="true"> · </span>
                      </>
                    )}
                    约 {estimateReadingMinutes(article.content)} 分钟阅读
                  </p>
                </div>
              </div>

              <div className="sm:ml-auto">
                <ArticleOwnerActions
                  articleId={article.id}
                  authorId={article.authorId}
                />
              </div>
            </div>
          </div>
        </header>

        {/* 正文区 */}
        <div className="px-6 py-10 sm:px-10">
          {article.summary && (
            <p className="mb-8 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-[15px] leading-7 text-slate-600">
              {article.summary}
            </p>
          )}

          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      <div className="mt-8 flex justify-center">
        <Link href="/" className="btn-outline">
          继续阅读其他文章
        </Link>
      </div>
    </main>
  );
}
