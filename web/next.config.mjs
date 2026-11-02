/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 关闭 App Router 客户端路由缓存对 dynamic 页面的缓存（默认 30 秒）。
    // 否则发布/删除文章后通过 Link 返回首页时仍会命中旧缓存，必须手动刷新才能看到最新列表。
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
