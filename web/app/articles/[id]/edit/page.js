"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteArticle, getArticleRaw, updateArticle } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import ArticleEditor from "@/components/ArticleEditor";

/**
 * 编辑页：作者加载自己的文章（含草稿）并支持保存与删除。
 */
export default function EditArticlePage({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 未登录跳转登录页；已登录则加载文章原始内容
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const data = await getArticleRaw(params.id);
        setArticle(data);
      } catch (e) {
        setError(e.message || "加载文章失败");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id, router]);

  async function handleSubmit(data) {
    const updated = await updateArticle(params.id, data);
    // 整页跳转，避免客户端路由缓存导致详情页展示旧内容
    window.location.href = `/articles/${updated.slug}`;
  }

  async function handleDelete() {
    await deleteArticle(params.id);
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="page-wide py-10 sm:py-12">
        <div className="card flex items-center justify-center gap-3 p-16 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
          正在加载文章...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-narrow flex min-h-[60vh] items-center py-16">
        <div className="card w-full p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-400">
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
                d="M12 9v4m0 4h.01M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
              />
            </svg>
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            无法编辑该文章
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link href="/" className="btn-primary mt-8">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wide py-10 sm:py-12">
      <header>
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
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          编辑文章
        </h1>
        <p className="mt-2 text-sm text-slate-500">修改后点击发布或保存草稿</p>
      </header>

      <div className="mt-7">
        <ArticleEditor
          initial={article}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
