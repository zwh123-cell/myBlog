"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";

/**
 * 作者操作入口：仅当当前登录用户是文章作者时显示「编辑」链接。
 */
export default function ArticleOwnerActions({ articleId, authorId }) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setIsOwner(Boolean(isLoggedIn() && user && String(user.id) === String(authorId)));
  }, [authorId]);

  if (!isOwner) return null;

  return (
    <Link href={`/articles/${articleId}/edit`} className="btn-ghost shrink-0">
      编辑
    </Link>
  );
}
