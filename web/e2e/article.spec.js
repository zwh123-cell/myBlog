const { test, expect } = require("@playwright/test");

const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:8080";
const suffix = Date.now();

/**
 * 构造唯一测试用户，避免重复注册冲突。
 */
function buildUser(prefix) {
  return {
    email: `e2e_${prefix}_${suffix}@example.com`,
    password: "password123",
    nickname: `E2E-${prefix}`,
  };
}

/**
 * 通过接口注册用户。
 */
async function registerViaApi(request, user) {
  const res = await request.post(`${API_BASE}/api/v1/auth/register`, { data: user });
  expect(res.ok()).toBeTruthy();
}

/**
 * 通过页面登录，登录成功后停留在首页。
 */
async function loginViaUi(page, user) {
  await page.goto("/login");
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test("作者可发布、查看、编辑并删除文章", async ({ page, request }) => {
  const author = buildUser("author");
  await registerViaApi(request, author);
  await loginViaUi(page, author);

  // 发布文章
  await page.goto("/write");
  await page.fill("#title", "E2E 测试文章");
  await page.fill("#content", "# 一级标题\n\n这是 E2E 正文内容。");
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await page.waitForURL(
    (url) => url.pathname.startsWith("/articles/") && !url.pathname.endsWith("/edit")
  );

  // 查看详情（标题 + Markdown 渲染）
  await expect(page.locator("article h1").first()).toContainText("E2E 测试文章");
  await expect(page.locator(".markdown-body h1")).toHaveText("一级标题");

  const detailPath = new URL(page.url()).pathname;
  const slug = detailPath.split("/")[2];

  // 作者可见编辑入口，进入编辑页
  const editLink = page.getByRole("link", { name: "编辑" });
  await expect(editLink).toBeVisible();
  const editHref = await editLink.getAttribute("href");

  await editLink.click();
  await page.waitForURL((url) => url.pathname.endsWith("/edit"));

  // 编辑并重新发布
  await page.fill("#title", "E2E 测试文章（已编辑）");
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await page.waitForURL((url) => url.pathname === `/articles/${slug}`);
  await expect(page.locator("article h1").first()).toContainText("E2E 测试文章（已编辑）");

  // 删除文章
  await page.goto(editHref);
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "删除文章" }).click();
  await page.waitForURL((url) => url.pathname === "/");

  // 删除后详情页提示不存在
  await page.goto(`/articles/${slug}`);
  await expect(page.getByRole("heading", { name: "文章不存在" })).toBeVisible();
});

test("非作者编辑他人文章被拒", async ({ browser, request }) => {
  const author = buildUser("owner");
  const other = buildUser("other");
  await registerViaApi(request, author);
  await registerViaApi(request, other);

  // 作者通过接口创建文章，获取文章 id
  const loginRes = await request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { email: author.email, password: author.password },
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;

  const createRes = await request.post(`${API_BASE}/api/v1/articles`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: "归属测试文章", content: "正文内容", status: "published" },
  });
  const createJson = await createRes.json();
  const articleId = createJson.data.id;

  // 另一用户在独立会话中登录并访问编辑页
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await loginViaUi(otherPage, other);

  await otherPage.goto(`/articles/${articleId}/edit`);
  await expect(otherPage.getByText("无法编辑该文章")).toBeVisible();
  await expect(otherPage.getByText("无权限")).toBeVisible();

  await otherContext.close();

  // 清理测试数据
  await request.delete(`${API_BASE}/api/v1/articles/${articleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});
