"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

/**
 * 注册页：邮箱 + 密码 + 昵称注册，成功后跳转登录页。
 */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
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
      await register({ email, password, nickname });
      router.replace("/login");
    } catch (err) {
      setError(err.message || "注册失败");
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
              从第一篇文章，
              <br />
              开始你的记录。
            </h2>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              创建账号只需几步，之后随时可以开始写作。
            </p>
          </div>

          <ul className="relative mt-10 space-y-3 text-sm text-indigo-50">
            {["注册即可发布与编辑文章", "Markdown 写作与实时预览", "轻量、专注的阅读体验"].map(
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
              创建账号
            </h1>
            <p className="mt-2 text-sm text-slate-500">创建账号，开始你的写作</p>
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
              <label htmlFor="nickname" className="label-field">
                昵称
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-field"
                placeholder="可选"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="至少 8 位"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            已有账号？{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              去登录
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
