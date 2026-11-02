import "./globals.css";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  title: "我的博客",
  description: "一个基于 Next.js + Spring Boot + MySQL 的博客网站",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
          <nav className="page-shell flex h-16 items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition group-hover:shadow-indigo-500/40">
                博
              </span>
              <span className="hidden whitespace-nowrap text-[17px] font-semibold tracking-tight text-slate-900 sm:inline">
                我的博客
                <span className="text-indigo-500">.</span>
              </span>
            </Link>
            <SiteNav />
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-slate-200/70 bg-white/40">
          <div className="page-shell flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} 我的博客 · 用文字记录思考</p>
            <p className="tracking-wide">Next.js · Spring Boot · MySQL</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
