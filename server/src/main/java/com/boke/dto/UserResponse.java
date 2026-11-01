package com.boke.dto;

import com.boke.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对外返回的安全用户信息，不包含密码哈希。
 */
@Data
public class UserResponse {

    private Long id;
    private String email;
    private String nickname;
    private String avatarUrl;
    private String bio;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    /**
     * 从用户实体构建安全响应对象。
     *
     * @param user 用户实体
     * @return 不含敏感字段的响应对象
     */
    public static UserResponse from(User user) {
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setNickname(user.getNickname());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setBio(user.getBio());
        resp.setRole(user.getRole());
        resp.setStatus(user.getStatus());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }
}
