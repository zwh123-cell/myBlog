package com.boke.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.boke.common.Result;
import com.boke.entity.Article;
import com.boke.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * 已发布文章列表（示例接口，用于验证前后端链路）
     */
    @GetMapping
    public Result<List<Article>> list() {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, "published")
               .orderByDesc(Article::getPublishedAt);
        return Result.success(articleService.list(wrapper));
    }
}
