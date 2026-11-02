package com.boke.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.boke.dto.ArticleRequest;
import com.boke.dto.ArticleResponse;
import com.boke.entity.Article;

/**
 * 文章业务接口，提供文章详情、发布、编辑、删除与作者原始内容加载能力。
 */
public interface ArticleService extends IService<Article> {

    /**
     * 按 slug 查询已发布文章详情。
     *
     * @param slug 文章唯一标识
     * @return 文章响应，不存在或未发布时抛出 2001
     */
    ArticleResponse getBySlug(String slug);

    /**
     * 发布 / 保存草稿。
     *
     * @param request 文章请求体
     * @return 创建后的文章响应
     */
    ArticleResponse create(ArticleRequest request);

    /**
     * 作者本人编辑自己的文章。
     *
     * @param id      文章主键
     * @param request 文章请求体
     * @return 更新后的文章响应
     */
    ArticleResponse update(Long id, ArticleRequest request);

    /**
     * 作者本人删除自己的文章。
     *
     * @param id 文章主键
     */
    void deleteArticle(Long id);

    /**
     * 作者本人加载自己的文章原始内容（含草稿），用于编辑回显。
     *
     * @param id 文章主键
     * @return 文章响应
     */
    ArticleResponse getRaw(Long id);
}
