"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import ArticleEditor from "@/components/ArticleEditor";

/**
 * 发布页：登录后撰写 Markdown 文章，支持保存草稿与发布。
 */
export default function WritePage() {
  const router = useRouter();

  // 未登录则跳转登录页
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [router]);

  async function handleSubmit(data) {
    const article = await createArticle(data);
    router.replace(`/articles/${article.slug}`);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        写文章
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        使用 Markdown 编写正文，右侧实时预览
      </p>

      <div className="mt-6">
        <ArticleEditor initial={{ status: "draft" }} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
