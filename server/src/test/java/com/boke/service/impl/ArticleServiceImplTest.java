package com.boke.service.impl;

import com.boke.common.BusinessException;
import com.boke.dto.ArticleRequest;
import com.boke.dto.ArticleResponse;
import com.boke.entity.Article;
import com.boke.entity.User;
import com.boke.mapper.ArticleMapper;
import com.boke.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * ArticleServiceImpl 单元测试，覆盖发布、详情、编辑、删除、slug 冲突与非作者越权被拒。
 */
@ExtendWith(MockitoExtension.class)
class ArticleServiceImplTest {

    @Mock
    private ArticleMapper articleMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private ArticleServiceImpl articleService;

    @BeforeEach
    void setUp() {
        // MyBatis-Plus 的 baseMapper 字段因泛型擦除无法被 Mockito 自动注入，需手动赋值
        ReflectionTestUtils.setField(articleService, "baseMapper", articleMapper);
        // 模拟当前登录用户 id 为 1
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("1", null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Article buildArticle(Long id, Long authorId, String status) {
        Article article = new Article();
        article.setId(id);
        article.setAuthorId(authorId);
        article.setTitle("Hello World");
        article.setSlug("hello-world");
        article.setSummary("summary");
        article.setContent("content");
        article.setStatus(status);
        return article;
    }

    private User buildUser(Long id, String nickname) {
        User user = new User();
        user.setId(id);
        user.setNickname(nickname);
        return user;
    }

    private ArticleRequest buildRequest(String title, String status) {
        ArticleRequest request = new ArticleRequest();
        request.setTitle(title);
        request.setSummary("summary");
        request.setContent("content");
        request.setStatus(status);
        return request;
    }

    @Test
    void getBySlug_published_returnsResponse() {
        when(articleMapper.selectOne(any())).thenReturn(buildArticle(1L, 1L, "published"));
        when(userService.getById(1L)).thenReturn(buildUser(1L, "作者"));

        ArticleResponse resp = articleService.getBySlug("hello-world");

        assertNotNull(resp);
        assertEquals("hello-world", resp.getSlug());
        assertEquals("作者", resp.getAuthorNickname());
        assertEquals("published", resp.getStatus());
    }

    @Test
    void getBySlug_notFound_throwsResourceNotFound() {
        when(articleMapper.selectOne(any())).thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class, () -> articleService.getBySlug("missing"));
        assertEquals(2001, ex.getCode());
    }

    @Test
    void create_publish_setsSlugAndPublishedAt() {
        when(articleMapper.selectCount(any())).thenReturn(0L);
        when(articleMapper.insert(any(Article.class))).thenAnswer(inv -> {
            Article a = inv.getArgument(0);
            a.setId(100L);
            return 1;
        });
        when(userService.getById(1L)).thenReturn(buildUser(1L, "作者"));

        ArticleResponse resp = articleService.create(buildRequest("Hello World", "published"));

        assertEquals("hello-world", resp.getSlug());
        assertEquals("published", resp.getStatus());
        assertNotNull(resp.getPublishedAt());
        assertEquals(1L, resp.getAuthorId());
    }

    @Test
    void create_draft_keepsPublishedAtNull() {
        when(articleMapper.selectCount(any())).thenReturn(0L);
        when(articleMapper.insert(any(Article.class))).thenAnswer(inv -> {
            Article a = inv.getArgument(0);
            a.setId(101L);
            return 1;
        });
        when(userService.getById(1L)).thenReturn(buildUser(1L, "作者"));

        ArticleResponse resp = articleService.create(buildRequest("Draft Post", "draft"));

        assertEquals("draft", resp.getStatus());
        assertNull(resp.getPublishedAt());
        assertEquals("draft-post", resp.getSlug());
    }

    @Test
    void create_slugConflict_appendsSuffix() {
        // 首次查询命中冲突，第二次（追加后缀后）不再冲突
        when(articleMapper.selectCount(any())).thenReturn(1L, 0L);
        when(articleMapper.insert(any(Article.class))).thenAnswer(inv -> {
            Article a = inv.getArgument(0);
            a.setId(102L);
            return 1;
        });
        when(userService.getById(1L)).thenReturn(buildUser(1L, "作者"));

        ArticleResponse resp = articleService.create(buildRequest("Hello World", "draft"));

        assertTrue(resp.getSlug().startsWith("hello-world-"));
        assertTrue(resp.getSlug().length() > "hello-world-".length());
    }

    @Test
    void update_author_success_updatesContent() {
        when(articleMapper.selectById(1L)).thenReturn(buildArticle(1L, 1L, "draft"));
        when(userService.getById(1L)).thenReturn(buildUser(1L, "作者"));

        ArticleResponse resp = articleService.update(1L, buildRequest("New Title", "published"));

        assertEquals("New Title", resp.getTitle());
        assertEquals("published", resp.getStatus());
        assertNotNull(resp.getPublishedAt());
        assertNotNull(resp.getUpdatedAt());
        verify(articleMapper).updateById(any(Article.class));
    }

    @Test
    void update_nonAuthor_throwsForbidden() {
        when(articleMapper.selectById(1L)).thenReturn(buildArticle(1L, 2L, "published"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> articleService.update(1L, buildRequest("New Title", "published")));
        assertEquals(1003, ex.getCode());
    }

    @Test
    void delete_author_success() {
        when(articleMapper.selectById(1L)).thenReturn(buildArticle(1L, 1L, "published"));

        articleService.deleteArticle(1L);

        verify(articleMapper).deleteById(1L);
    }

    @Test
    void delete_nonAuthor_throwsForbidden() {
        when(articleMapper.selectById(1L)).thenReturn(buildArticle(1L, 2L, "published"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> articleService.deleteArticle(1L));
        assertEquals(1003, ex.getCode());
    }

    @Test
    void getRaw_nonAuthor_throwsForbidden() {
        when(articleMapper.selectById(1L)).thenReturn(buildArticle(1L, 2L, "draft"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> articleService.getRaw(1L));
        assertEquals(1003, ex.getCode());
    }
}
