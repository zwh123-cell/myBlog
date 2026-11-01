package com.boke.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * JwtUtil 单元测试，验证 Access Token 签发→校验往返与 Refresh Token 随机性。
 */
class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil(
            "test-access-secret-key-0123456789abcdef",
            900000L,
            604800000L);

    @Test
    void generateAndParseAccessToken_roundTrip() {
        String token = jwtUtil.generateAccessToken(1L, "user");

        Claims claims = jwtUtil.parseAccessToken(token);

        assertEquals("1", claims.getSubject());
        assertEquals("user", claims.get("role", String.class));
    }

    @Test
    void generateRefreshToken_isRandomAndNonEmpty() {
        String first = jwtUtil.generateRefreshToken();
        String second = jwtUtil.generateRefreshToken();

        assertNotNull(first);
        assertFalse(first.isBlank());
        assertNotEquals(first, second);
    }
}
