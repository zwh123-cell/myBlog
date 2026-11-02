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

// 导航项，用于渲染并高亮当前所在页面
const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/write", label: "写文章" },
];

/**
 * 取用户头像占位文字：优先昵称首字符，其次邮箱首字母。
 *
 * @param {Object|null} user 当前登录用户
 * @returns {string} 单个字符，未登录时为空字符串
 */
function getAvatarText(user) {
  const source = user?.nickname || user?.email || "";
  return source.trim().slice(0, 1).toUpperCase();
}

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

  /**
   * 判断导航项是否为当前页：首页需精确匹配，其它页面按前缀匹配子路由。
   */
  function isActive(href) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

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
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center rounded-xl bg-slate-100/70 p-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(item.href)
                ? "whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-sm font-medium text-indigo-600 shadow-sm sm:px-3"
                : "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:px-3"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>

      {user ? (
        <div className="flex items-center gap-1">
          <span className="hidden items-center gap-2 rounded-xl bg-white/70 py-1 pl-1 pr-3 ring-1 ring-inset ring-slate-200/70 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
              {getAvatarText(user)}
            </span>
            <span className="max-w-[8rem] truncate text-sm font-medium text-slate-700">
              {user.nickname || user.email}
            </span>
          </span>
          <button type="button" onClick={handleLogout} className="btn-ghost whitespace-nowrap">
            退出登录
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/login" className="btn-ghost whitespace-nowrap px-2.5 sm:px-3">
            登录
          </Link>
          <Link href="/register" className="btn-primary whitespace-nowrap px-3 sm:px-4">
            注册
          </Link>
        </div>
      )}
    </div>
  );
}
