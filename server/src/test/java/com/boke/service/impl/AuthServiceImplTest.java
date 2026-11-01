package com.boke.service.impl;

import com.boke.common.BusinessException;
import com.boke.dto.AuthResponse;
import com.boke.dto.LoginRequest;
import com.boke.dto.RefreshRequest;
import com.boke.dto.RegisterRequest;
import com.boke.dto.UserResponse;
import com.boke.entity.User;
import com.boke.security.JwtUtil;
import com.boke.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * AuthServiceImpl 单元测试，覆盖注册、登录、刷新与登出的核心业务分支。
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthServiceImpl authService;

    private User buildUser(String email, String status) {
        User user = new User();
        user.setId(1L);
        user.setEmail(email);
        user.setPasswordHash("hashed");
        user.setNickname("测试");
        user.setRole("user");
        user.setStatus(status);
        return user;
    }

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setNickname("新用户");

        when(userService.getByEmail("new@example.com")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userService.createUser(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UserResponse resp = authService.register(request);

        assertNotNull(resp);
        assertEquals("new@example.com", resp.getEmail());
        assertEquals("新用户", resp.getNickname());
        assertEquals("user", resp.getRole());
        assertEquals("active", resp.getStatus());
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("exists@example.com");
        request.setPassword("password123");

        when(userService.getByEmail("exists@example.com")).thenReturn(buildUser("exists@example.com", "active"));

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(request));
        assertEquals(2002, ex.getCode());
    }

    @Test
    void login_success_returnsTokens() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        when(userService.getByEmail("user@example.com")).thenReturn(buildUser("user@example.com", "active"));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtUtil.generateAccessToken(1L, "user")).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken()).thenReturn("refresh-token");
        when(jwtUtil.getRefreshExpiration()).thenReturn(604800000L);

        AuthResponse resp = authService.login(request);

        assertEquals("access-token", resp.getAccessToken());
        assertEquals("refresh-token", resp.getRefreshToken());
        assertEquals("user@example.com", resp.getUser().getEmail());
        verify(valueOperations).set(eq("auth:refresh:refresh-token"), eq("1"), eq(604800000L), any());
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong");

        when(userService.getByEmail("user@example.com")).thenReturn(buildUser("user@example.com", "active"));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.login(request));
        assertEquals(1002, ex.getCode());
    }

    @Test
    void login_banned_throwsForbidden() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        when(userService.getByEmail("user@example.com")).thenReturn(buildUser("user@example.com", "banned"));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.login(request));
        assertEquals(1003, ex.getCode());
    }

    @Test
    void refresh_success_returnsNewAccessToken() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("refresh-token");

        when(valueOperations.get("auth:refresh:refresh-token")).thenReturn("1");
        when(userService.getById(1L)).thenReturn(buildUser("user@example.com", "active"));
        when(jwtUtil.generateAccessToken(1L, "user")).thenReturn("new-access-token");

        AuthResponse resp = authService.refresh(request);

        assertEquals("new-access-token", resp.getAccessToken());
        assertEquals("refresh-token", resp.getRefreshToken());
    }

    @Test
    void refresh_invalidToken_throwsUnauthorized() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("invalid-token");

        when(valueOperations.get("auth:refresh:invalid-token")).thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.refresh(request));
        assertEquals(1002, ex.getCode());
    }

    @Test
    void logout_deletesRefreshToken() {
        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("refresh-token");

        authService.logout(request);

        verify(redisTemplate).delete("auth:refresh:refresh-token");
    }
}
