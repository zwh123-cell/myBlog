package com.boke.controller;

import com.boke.common.BusinessException;
import com.boke.config.SecurityConfig;
import com.boke.dto.ArticleRequest;
import com.boke.dto.ArticleResponse;
import com.boke.security.JwtAuthenticationFilter;
import com.boke.security.JwtUtil;
import com.boke.service.ArticleService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ArticleController 接口测试（MockMvc + SecurityConfig），覆盖鉴权、参数校验与业务错误码。
 */
@WebMvcTest(ArticleController.class)
@Import({SecurityConfig.class, ArticleControllerTest.TestConfig.class})
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ArticleService articleService;

    @MockBean
    private JwtUtil jwtUtil;

    @TestConfiguration
    static class TestConfig {

        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil) {
            return new JwtAuthenticationFilter(jwtUtil);
        }
    }

    private ArticleResponse buildResponse() {
        ArticleResponse resp = new ArticleResponse();
        resp.setId(1L);
        resp.setAuthorId(1L);
        resp.setAuthorNickname("作者");
        resp.setTitle("Hello World");
        resp.setSlug("hello-world");
        resp.setContent("# 内容");
        resp.setStatus("published");
        return resp;
    }

    private void mockValidToken() {
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("role", String.class)).thenReturn("user");
        when(jwtUtil.parseAccessToken("valid-token")).thenReturn(claims);
    }

    @Test
    void getBySlug_public_returnsDetail() throws Exception {
        when(articleService.getBySlug("hello-world")).thenReturn(buildResponse());

        mockMvc.perform(get("/api/v1/articles/hello-world"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("hello-world"))
                .andExpect(jsonPath("$.data.authorNickname").value("作者"));
    }

    @Test
    void create_withoutAuth_returns1002() throws Exception {
        String body = "{\"title\":\"Hello World\",\"content\":\"正文\",\"status\":\"published\"}";

        mockMvc.perform(post("/api/v1/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1002));
    }

    @Test
    void create_withAuth_success() throws Exception {
        mockValidToken();
        when(articleService.create(any())).thenReturn(buildResponse());

        String body = "{\"title\":\"Hello World\",\"summary\":\"摘要\",\"content\":\"正文\",\"status\":\"published\"}";

        mockMvc.perform(post("/api/v1/articles")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("hello-world"));
    }

    @Test
    void create_withAuth_validationError_returns1001() throws Exception {
        mockValidToken();

        String body = "{\"title\":\"\",\"content\":\"\",\"status\":\"published\"}";

        mockMvc.perform(post("/api/v1/articles")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1001));
    }

    @Test
    void update_author_success() throws Exception {
        mockValidToken();
        when(articleService.update(any(Long.class), any(ArticleRequest.class))).thenReturn(buildResponse());

        String body = "{\"title\":\"New Title\",\"content\":\"正文\",\"status\":\"published\"}";

        mockMvc.perform(put("/api/v1/articles/1")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("hello-world"));
    }

    @Test
    void update_nonAuthor_returns1003() throws Exception {
        mockValidToken();
        when(articleService.update(any(Long.class), any(ArticleRequest.class))).thenThrow(new BusinessException(1003, "无权限"));

        String body = "{\"title\":\"New Title\",\"content\":\"正文\",\"status\":\"published\"}";

        mockMvc.perform(put("/api/v1/articles/1")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1003));
    }

    @Test
    void delete_author_success() throws Exception {
        mockValidToken();

        mockMvc.perform(delete("/api/v1/articles/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void delete_nonAuthor_returns1003() throws Exception {
        mockValidToken();
        org.mockito.Mockito.doThrow(new BusinessException(1003, "无权限"))
                .when(articleService).deleteArticle(1L);

        mockMvc.perform(delete("/api/v1/articles/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1003));
    }

    @Test
    void getRaw_nonAuthor_returns1003() throws Exception {
        mockValidToken();
        when(articleService.getRaw(1L)).thenThrow(new BusinessException(1003, "无权限"));

        mockMvc.perform(get("/api/v1/articles/1/raw")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1003));
    }
}
