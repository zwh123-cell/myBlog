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
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-10">
      <div className="auth-card">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            欢迎回来
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            登录后即可发表文章与评论
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
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

        <p className="mt-6 text-center text-sm text-slate-600">
          还没有账号？{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            立即注册
          </Link>
        </p>
      </div>
    </main>
  );
}
