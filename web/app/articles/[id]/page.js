import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug } from "@/lib/api";
import ArticleOwnerActions from "./ArticleOwnerActions";

// 强制动态渲染，避免构建时因后端未启动而失败
export const dynamic = "force-dynamic";

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
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="card p-10 text-center">
          <h1 className="text-xl font-semibold text-slate-900">文章不存在</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "该文章可能已被删除或尚未发布"}
          </p>
          <Link href="/" className="btn-primary mt-6">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <article>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {article.title}
          </h1>
          <ArticleOwnerActions articleId={article.id} authorId={article.authorId} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{article.authorNickname || "匿名作者"}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={new Date(article.publishedAt).toISOString()}>
                {new Date(article.publishedAt).toLocaleDateString("zh-CN")}
              </time>
            </>
          )}
        </div>

        {article.summary && (
          <p className="mt-6 rounded-xl bg-slate-100 p-4 text-slate-600">
            {article.summary}
          </p>
        )}

        <div className="markdown-body mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || ""}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
