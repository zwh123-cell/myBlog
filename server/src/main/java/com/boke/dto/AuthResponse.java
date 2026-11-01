package com.boke.dto;

import lombok.Data;

/**
 * 认证成功响应体，包含访问令牌、刷新令牌与用户信息。
 */
@Data
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserResponse user;
}
