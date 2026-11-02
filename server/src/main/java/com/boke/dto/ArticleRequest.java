package com.boke.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 文章发布 / 编辑请求体。
 */
@Data
public class ArticleRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题长度不能超过 200 位")
    private String title;

    @Size(max = 500, message = "摘要长度不能超过 500 位")
    private String summary;

    @NotBlank(message = "正文不能为空")
    private String content;

    @NotBlank(message = "状态不能为空")
    @Pattern(regexp = "draft|published", message = "状态只能为 draft 或 published")
    private String status;
}
