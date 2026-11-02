package com.boke.dto;

import com.boke.entity.Article;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对外返回的文章信息，包含作者昵称。
 */
@Data
public class ArticleResponse {

    private Long id;
    private Long authorId;
    private String authorNickname;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 从文章实体构建响应对象。
     *
     * @param article        文章实体
     * @param authorNickname 作者昵称
     * @return 文章响应对象
     */
    public static ArticleResponse from(Article article, String authorNickname) {
        ArticleResponse resp = new ArticleResponse();
        resp.setId(article.getId());
        resp.setAuthorId(article.getAuthorId());
        resp.setAuthorNickname(authorNickname);
        resp.setTitle(article.getTitle());
        resp.setSlug(article.getSlug());
        resp.setSummary(article.getSummary());
        resp.setContent(article.getContent());
        resp.setStatus(article.getStatus());
        resp.setPublishedAt(article.getPublishedAt());
        resp.setCreatedAt(article.getCreatedAt());
        resp.setUpdatedAt(article.getUpdatedAt());
        return resp;
    }
}
