"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { isLoggedIn, setCurrentUser, setTokens } from "@/lib/auth";

/**
 * 登录页：邮箱 + 密码登录，成功后保存令牌并跳转首页。
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 已登录则直接回首页
  if (isLoggedIn()) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      setTokens(data.accessToken, data.refreshToken);
      setCurrentUser(data.user);
      router.replace("/");
    } catch (err) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 sm:py-16">
      <div className="auth-card">
        {/* 左侧品牌介绍：小屏隐藏 */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-300/25 blur-3xl"
          />

          <div className="relative">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-inset ring-white/30 backdrop-blur">
              博
            </span>
            <h2 className="mt-8 text-2xl font-bold leading-snug">
              把零散的思考，
              <br />
              写成一篇文章。
            </h2>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              登录后即可发布、编辑与管理你的文章。
            </p>
          </div>

          <ul className="relative mt-10 space-y-3 text-sm text-indigo-50">
            {["Markdown 写作与实时预览", "文章随写随发，随时修改", "轻量、专注的阅读体验"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12.5 4.5 4.5L19 7"
                    />
                  </svg>
                  {item}
                </li>
              )
            )}
          </ul>
        </aside>

        {/* 右侧表单 */}
        <div className="p-8 sm:p-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              欢迎回来
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              登录后即可发表文章与评论
            </p>
          </div>

          {error && (
            <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label-field">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-field">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            还没有账号？{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
