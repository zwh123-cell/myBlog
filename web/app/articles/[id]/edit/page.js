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
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="card p-10 text-center text-slate-500">加载中...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="card p-10 text-center">
          <h1 className="text-xl font-semibold text-slate-900">无法编辑该文章</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link href="/" className="btn-primary mt-6">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        编辑文章
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        修改后点击发布或保存草稿
      </p>

      <div className="mt-6">
        <ArticleEditor
          initial={article}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
