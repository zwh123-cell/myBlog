-- 博客网站初始化脚本
-- 由 docker-entrypoint-initdb.d 在 MySQL 首次启动时自动执行

CREATE DATABASE IF NOT EXISTS blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname      VARCHAR(50),
    avatar_url    VARCHAR(255),
    bio           TEXT,
    role          VARCHAR(20) DEFAULT 'user',
    status        VARCHAR(20) DEFAULT 'active',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    parent_id  BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id    BIGINT NOT NULL,
    category_id  BIGINT NULL,
    title        VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    summary      VARCHAR(500),
    content      LONGTEXT,
    cover_url    VARCHAR(255),
    status       VARCHAR(20) DEFAULT 'draft',
    is_pinned    TINYINT(1)  DEFAULT 0,
    view_count   INT         DEFAULT 0,
    like_count   INT         DEFAULT 0,
    published_at DATETIME NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_author (author_id),
    KEY idx_category (category_id),
    KEY idx_status_published (status, published_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 文章-标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
    article_id BIGINT NOT NULL,
    tag_id     BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    parent_id  BIGINT NULL,
    content    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_article (article_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    article_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_article (user_id, article_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    article_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_article (user_id, article_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 示例数据（可选，取消注释后生效）
-- INSERT INTO articles (author_id, title, slug, summary, content, status, published_at)
-- VALUES (1, '欢迎来到我的博客', 'welcome', '这是第一篇示例文章',
--         '## 你好\n\n这是一篇示例文章，用于验证前后端链路。', 'published', NOW());
