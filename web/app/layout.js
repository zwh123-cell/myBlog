import "./globals.css";

export const metadata = {
  title: "我的博客",
  description: "一个基于 Next.js + Spring Boot + MySQL 的博客网站",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
