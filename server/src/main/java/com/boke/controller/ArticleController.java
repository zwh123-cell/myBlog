package com.boke.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.boke.common.Result;
import com.boke.dto.ArticleRequest;
import com.boke.dto.ArticleResponse;
import com.boke.entity.Article;
import com.boke.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 文章接口：提供列表、详情、发布、编辑、删除与作者原始内容加载。
 */
@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * 已发布文章列表。
     */
    @GetMapping
    public Result<List<Article>> list() {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, "published")
               .orderByDesc(Article::getPublishedAt);
        return Result.success(articleService.list(wrapper));
    }

    /**
     * 按 slug 查看已发布文章详情。
     */
    @GetMapping("/{slug}")
    public Result<ArticleResponse> getBySlug(@PathVariable String slug) {
        return Result.success(articleService.getBySlug(slug));
    }

    /**
     * 发布 / 保存草稿（需认证）。
     */
    @PostMapping
    public Result<ArticleResponse> create(@Valid @RequestBody ArticleRequest request) {
        return Result.success(articleService.create(request));
    }

    /**
     * 作者本人编辑文章（需认证）。
     */
    @PutMapping("/{id}")
    public Result<ArticleResponse> update(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return Result.success(articleService.update(id, request));
    }

    /**
     * 作者本人删除文章（需认证）。
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success();
    }

    /**
     * 作者本人加载自己的文章原始内容，用于编辑回显（需认证）。
     */
    @GetMapping("/{id}/raw")
    public Result<ArticleResponse> getRaw(@PathVariable Long id) {
        return Result.success(articleService.getRaw(id));
    }
}
