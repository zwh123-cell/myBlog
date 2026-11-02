"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 文章编辑器：Markdown 输入 + 实时预览，供发布页与编辑页复用。
 *
 * @param {Object}   initial   初始文章数据（title/summary/content/status）
 * @param {Function} onSubmit  提交回调，参数为 { title, summary, content, status }
 * @param {Function} [onDelete] 删除回调，存在时展示删除按钮
 */
export default function ArticleEditor({ initial, onSubmit, onDelete }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [content, setContent] = useState(initial?.content || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 校验并提交文章，nextStatus 决定保存为草稿还是发布。
   */
  async function handleSubmit(nextStatus) {
    if (!title.trim()) {
      setError("标题不能为空");
      return;
    }
    if (!content.trim()) {
      setError("正文不能为空");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title, summary, content, status: nextStatus });
    } catch (e) {
      setError(e.message || "提交失败");
      setLoading(false);
    }
  }

  /**
   * 删除当前文章，二次确认后执行。
   */
  async function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm("确定删除这篇文章吗？删除后不可恢复。")) return;
    setError(null);
    setLoading(true);
    try {
      await onDelete();
    } catch (e) {
      setError(e.message || "删除失败");
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 输入区 */}
        <div className="card p-6">
          <div>
            <label htmlFor="title" className="label-field">
              标题
            </label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="请输入文章标题"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="summary" className="label-field">
              摘要
            </label>
            <input
              id="summary"
              type="text"
              value={summary}
              maxLength={500}
              onChange={(e) => setSummary(e.target.value)}
              className="input-field"
              placeholder="可选，列表与详情页展示"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="content" className="label-field">
              正文（Markdown）
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="input-field font-mono"
              placeholder={"# 标题\n\n开始用 Markdown 写作..."}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("published")}
              className="btn-primary"
            >
              {loading ? "提交中..." : "发布"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("draft")}
              className="btn-ghost"
            >
              保存草稿
            </button>
            {onDelete && (
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                删除文章
              </button>
            )}
          </div>
        </div>

        {/* 预览区 */}
        <div className="card p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-sm font-medium text-slate-500">实时预览</span>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-900">
              {title || "文章标题"}
            </h1>
            <div className="markdown-body mt-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "（正文预览）"}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
