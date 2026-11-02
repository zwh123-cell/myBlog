"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearTokens,
  getCurrentUser,
  getRefreshToken,
  isLoggedIn,
} from "@/lib/auth";
import { logout as logoutApi } from "@/lib/api";

/**
 * 顶部导航：根据本地登录态显示「登录/注册」或「昵称/退出登录」。
 * 依赖 pathname 变化重新读取登录态，确保登录跳转后能立即刷新显示。
 */
export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(isLoggedIn() ? getCurrentUser() : null);
  }, [pathname]);

  async function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch {
        // 忽略登出接口异常，本地令牌仍需清除
      }
    }
    clearTokens();
    setUser(null);
    router.replace("/");
  }

  return (
    <div className="flex items-center gap-1">
      <Link href="/" className="btn-ghost">
        首页
      </Link>
      <Link href="/write" className="btn-ghost">
        写文章
      </Link>
      {user ? (
        <>
          <span className="hidden px-2 text-sm text-slate-600 sm:inline">
            {user.nickname || user.email}
          </span>
          <button type="button" onClick={handleLogout} className="btn-ghost">
            退出登录
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="btn-ghost">
            登录
          </Link>
          <Link href="/register" className="btn-primary">
            注册
          </Link>
        </>
      )}
    </div>
  );
}
