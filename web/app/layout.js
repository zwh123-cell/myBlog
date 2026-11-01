import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "我的博客",
  description: "一个基于 Next.js + Spring Boot + MySQL 的博客网站",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              我的博客
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/" className="btn-ghost">
                首页
              </Link>
              <Link href="/login" className="btn-ghost">
                登录
              </Link>
              <Link href="/register" className="btn-primary">
                注册
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
