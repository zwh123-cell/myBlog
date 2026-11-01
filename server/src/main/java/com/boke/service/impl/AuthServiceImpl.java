package com.boke.service.impl;

import com.boke.common.BusinessException;
import com.boke.dto.AuthResponse;
import com.boke.dto.LoginRequest;
import com.boke.dto.RefreshRequest;
import com.boke.dto.RegisterRequest;
import com.boke.dto.UserResponse;
import com.boke.entity.User;
import com.boke.security.JwtUtil;
import com.boke.service.AuthService;
import com.boke.service.UserService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * 认证业务实现，编排用户数据、密码校验、令牌签发与 Redis 会话管理。
 */
@Service
public class AuthServiceImpl implements AuthService {

    /** Refresh Token 在 Redis 中的键前缀 */
    private static final String REFRESH_KEY_PREFIX = "auth:refresh:";

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    public AuthServiceImpl(UserService userService,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           StringRedisTemplate redisTemplate) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
    }

    /**
     * 注册：校验邮箱唯一性，BCrypt 哈希后落库。
     */
    @Override
    public UserResponse register(RegisterRequest request) {
        if (userService.getByEmail(request.getEmail()) != null) {
            throw new BusinessException(2002, "邮箱已被注册");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() == null || request.getNickname().isBlank()
                ? request.getEmail().split("@")[0]
                : request.getNickname());
        user.setRole("user");
        user.setStatus("active");

        return UserResponse.from(userService.createUser(user));
    }

    /**
     * 登录：校验密码与账号状态，签发双令牌并写入 Redis。
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userService.getByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(1002, "邮箱或密码错误");
        }
        if ("banned".equals(user.getStatus())) {
            throw new BusinessException(1003, "账号已被封禁");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken();
        storeRefreshToken(refreshToken, user.getId());

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    /**
     * 刷新：校验 Redis 中的 Refresh Token 并换发新的 Access Token。
     */
    @Override
    public AuthResponse refresh(RefreshRequest request) {
        String key = REFRESH_KEY_PREFIX + request.getRefreshToken();
        String userId = redisTemplate.opsForValue().get(key);
        if (userId == null) {
            throw new BusinessException(1002, "刷新令牌无效或已过期");
        }

        User user = userService.getById(Long.valueOf(userId));
        if (user == null || "banned".equals(user.getStatus())) {
            throw new BusinessException(1003, "账号不可用");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole());
        return buildAuthResponse(accessToken, request.getRefreshToken(), user);
    }

    /**
     * 登出：删除 Redis 中的 Refresh Token。
     */
    @Override
    public void logout(RefreshRequest request) {
        redisTemplate.delete(REFRESH_KEY_PREFIX + request.getRefreshToken());
    }

    /**
     * 将 Refresh Token 与用户 id 写入 Redis，并设置过期时间。
     */
    private void storeRefreshToken(String refreshToken, Long userId) {
        redisTemplate.opsForValue().set(
                REFRESH_KEY_PREFIX + refreshToken,
                String.valueOf(userId),
                jwtUtil.getRefreshExpiration(),
                TimeUnit.MILLISECONDS);
    }

    /**
     * 组装认证响应。
     */
    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        AuthResponse resp = new AuthResponse();
        resp.setAccessToken(accessToken);
        resp.setRefreshToken(refreshToken);
        resp.setUser(UserResponse.from(user));
        return resp;
    }
}
