package com.boke.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.boke.common.BusinessException;
import com.boke.dto.ArticleRequest;
import com.boke.dto.ArticleResponse;
import com.boke.entity.Article;
import com.boke.entity.User;
import com.boke.mapper.ArticleMapper;
import com.boke.service.ArticleService;
import com.boke.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;

/**
 * 文章业务实现，负责详情查询、发布 / 草稿、编辑、删除与作者权限校验。
 */
@Service
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements ArticleService {

    /** 文章已发布状态 */
    private static final String STATUS_PUBLISHED = "published";

    private final UserService userService;

    /** 用于生成 slug 随机后缀的安全随机源 */
    private final SecureRandom secureRandom = new SecureRandom();

    public ArticleServiceImpl(UserService userService) {
        this.userService = userService;
    }

    /**
     * 按 slug 查询已发布文章详情。
     */
    @Override
    public ArticleResponse getBySlug(String slug) {
        Article article = getBaseMapper().selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getSlug, slug)
                .eq(Article::getStatus, STATUS_PUBLISHED));
        if (article == null) {
            throw new BusinessException(2001, "文章不存在");
        }
        return toResponse(article);
    }

    /**
     * 发布 / 保存草稿：生成唯一 slug 并落库。
     */
    @Override
    public ArticleResponse create(ArticleRequest request) {
        Article article = new Article();
        article.setAuthorId(currentUserId());
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setStatus(request.getStatus());
        article.setSlug(generateUniqueSlug(request.getTitle()));
        article.setViewCount(0);
        article.setLikeCount(0);
        article.setIsPinned(false);
        if (STATUS_PUBLISHED.equals(request.getStatus())) {
            article.setPublishedAt(LocalDateTime.now());
        }
        save(article);
        return toResponse(article);
    }

    /**
     * 作者本人编辑文章：校验作者身份后更新内容，编辑不改变已生成 slug。
     */
    @Override
    public ArticleResponse update(Long id, ArticleRequest request) {
        Article article = getById(id);
        if (article == null) {
            throw new BusinessException(2001, "文章不存在");
        }
        checkAuthor(article);

        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        // 草稿转发布时记录发布时间
        if (STATUS_PUBLISHED.equals(request.getStatus()) && !STATUS_PUBLISHED.equals(article.getStatus())) {
            article.setPublishedAt(LocalDateTime.now());
        }
        article.setStatus(request.getStatus());
        article.setUpdatedAt(LocalDateTime.now());
        updateById(article);
        return toResponse(article);
    }

    /**
     * 作者本人删除文章。
     */
    @Override
    public void deleteArticle(Long id) {
        Article article = getById(id);
        if (article == null) {
            throw new BusinessException(2001, "文章不存在");
        }
        checkAuthor(article);
        removeById(id);
    }

    /**
     * 作者本人加载自己的文章原始内容（含草稿）。
     */
    @Override
    public ArticleResponse getRaw(Long id) {
        Article article = getById(id);
        if (article == null) {
            throw new BusinessException(2001, "文章不存在");
        }
        checkAuthor(article);
        return toResponse(article);
    }

    /**
     * 生成唯一 slug：标题可转 ASCII 时转 kebab-case，否则回退为 article-时间戳；
     * 冲突时在末尾追加随机后缀保证唯一。
     */
    private String generateUniqueSlug(String title) {
        String base = toSlug(title);
        String slug = base;
        while (slugExists(slug)) {
            slug = base + "-" + randomSuffix();
        }
        return slug;
    }

    /**
     * 将标题转换为基础 slug（不含冲突处理）。
     */
    private String toSlug(String title) {
        if (title == null || title.isBlank()) {
            return "article-" + Instant.now().getEpochSecond();
        }
        // 仅当标题全部为 ASCII 字符时才做 kebab-case，避免中文被误删
        boolean ascii = title.chars().allMatch(c -> c < 128);
        if (!ascii) {
            return "article-" + Instant.now().getEpochSecond();
        }
        String slug = title.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? "article-" + Instant.now().getEpochSecond() : slug;
    }

    /**
     * 判断 slug 是否已被占用。
     */
    private boolean slugExists(String slug) {
        return count(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug)) > 0;
    }

    /**
     * 生成 6 位十六进制随机后缀。
     */
    private String randomSuffix() {
        byte[] bytes = new byte[3];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /**
     * 从 SecurityContext 获取当前登录用户 id。
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new BusinessException(1002, "未认证或令牌失效");
        }
        return Long.valueOf(auth.getPrincipal().toString());
    }

    /**
     * 校验当前用户是否为文章作者，非作者抛出 1003。
     */
    private void checkAuthor(Article article) {
        Long userId = currentUserId();
        if (!userId.equals(article.getAuthorId())) {
            throw new BusinessException(1003, "无权限");
        }
    }

    /**
     * 构建文章响应并附带作者昵称。
     */
    private ArticleResponse toResponse(Article article) {
        String nickname = null;
        User user = userService.getById(article.getAuthorId());
        if (user != null) {
            nickname = user.getNickname();
        }
        return ArticleResponse.from(article, nickname);
    }
}
