package com.boke.service;

import com.boke.dto.AuthResponse;
import com.boke.dto.LoginRequest;
import com.boke.dto.RefreshRequest;
import com.boke.dto.RegisterRequest;
import com.boke.dto.UserResponse;

/**
 * 认证业务接口，提供注册、登录、刷新与登出能力。
 */
public interface AuthService {

    /**
     * 用户注册。
     *
     * @param request 注册请求
     * @return 注册后的用户信息
     */
    UserResponse register(RegisterRequest request);

    /**
     * 用户登录，成功后返回双令牌与用户信息。
     *
     * @param request 登录请求
     * @return 认证响应
     */
    AuthResponse login(LoginRequest request);

    /**
     * 刷新令牌，使用有效的 Refresh Token 换取新的 Access Token。
     *
     * @param request 刷新请求
     * @return 新的认证响应
     */
    AuthResponse refresh(RefreshRequest request);

    /**
     * 用户登出，使 Refresh Token 失效。
     *
     * @param request 登出请求
     */
    void logout(RefreshRequest request);
}
