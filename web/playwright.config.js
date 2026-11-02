const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright 端到端测试配置。
 * 复用系统已安装的 Chrome（channel: "chrome"），无需额外下载浏览器。
 */
module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
