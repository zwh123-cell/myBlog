// 展示层通用格式化工具：日期与阅读时长，供首页、详情页复用。

/**
 * 将后端返回的时间字符串格式化为「2026年11月2日」。
 *
 * @param {string|number|Date|null|undefined} value 时间值
 * @returns {string} 格式化后的日期；时间为空或非法时返回空字符串，避免出现 Invalid Date
 */
export function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 依据正文字数粗估阅读时长（按中文约 350 字/分钟），最少返回 1 分钟。
 *
 * @param {string|null|undefined} content 文章正文（Markdown 原文）
 * @returns {number} 预估阅读分钟数
 */
export function estimateReadingMinutes(content) {
  const text = (content || "").replace(/\s+/g, "");
  return Math.max(1, Math.ceil(text.length / 350));
}
