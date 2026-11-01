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
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-10">
      <div className="auth-card">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            创建账号
          </h1>
          <p className="mt-2 text-sm text-slate-600">创建账号，开始你的写作</p>
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

        <p className="mt-6 text-center text-sm text-slate-600">
          已有账号？{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}
