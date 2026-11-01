package com.boke.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("articles")
public class Article {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long authorId;

    private Long categoryId;

    private String title;

    private String slug;

    private String summary;

    private String content;

    private String coverUrl;

    private String status;

    private Boolean isPinned;

    private Integer viewCount;

    private Integer likeCount;

    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
