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
    <Link href={`/articles/${articleId}/edit`} className="btn-outline shrink-0">
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15 5 4 4M4 20l1-4.5L16.5 4a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.5 19 4 20Z"
        />
      </svg>
      编辑
    </Link>
  );
}
