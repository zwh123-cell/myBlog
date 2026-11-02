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

  // 正文字数（去掉空白），用于编辑器底部的实时统计
  const contentLength = content.replace(/\s+/g, "").length;

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
      {/* 顶部操作栏：常驻显示，长文写作时无需滚动到底部提交 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
              />
            </svg>
          </span>
          支持 Markdown 语法
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {onDelete && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              删除文章
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("draft")}
            className="btn-outline"
          >
            保存草稿
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("published")}
            className="btn-primary"
          >
            {loading ? "提交中..." : "发布"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 输入区 */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">写作</h2>
            <span className="text-xs tabular-nums text-slate-400">
              {title.length}/200
            </span>
          </div>

          <div className="mt-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="summary" className="label-field">
                摘要
              </label>
              <span className="text-xs tabular-nums text-slate-400">
                {summary.length}/500
              </span>
            </div>
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
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="label-field">
                正文
              </label>
              <span className="text-xs tabular-nums text-slate-400">
                {contentLength} 字
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="input-field min-h-[320px] resize-y font-mono text-[13px] leading-6"
              placeholder={"# 标题\n\n开始用 Markdown 写作..."}
            />
          </div>
        </div>

        {/* 预览区：与编辑区等高，内容超出时内部滚动 */}
        <div className="card flex flex-col p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              实时预览
            </span>
            <span className="text-xs text-slate-400">Markdown 渲染效果</span>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title || (
                <span className="text-slate-300">文章标题</span>
              )}
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
