package com.boke.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;
import java.util.HexFormat;

/**
 * JWT 工具，负责签发 / 校验 Access Token，并生成随机的 Refresh Token。
 */
@Component
public class JwtUtil {

    private final SecretKey accessKey;
    private final long accessExpiration;
    private final long refreshExpiration;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtUtil(
            @Value("${jwt.access-secret}") String accessSecret,
            @Value("${jwt.access-expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration) {
        // HS256 要求密钥至少 32 字节，application.yml 中的默认密钥已满足该长度
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    /**
     * 签发 Access Token，subject 为用户 id，附带 role 声明。
     *
     * @param userId 用户主键
     * @param role   用户角色
     * @return JWT 字符串
     */
    public String generateAccessToken(Long userId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessExpiration);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(accessKey)
                .compact();
    }

    /**
     * 校验并解析 Access Token。
     *
     * @param token JWT 字符串
     * @return 令牌载荷，签名无效或已过期时抛出 JwtException
     */
    public Claims parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(accessKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 生成随机的 Refresh Token（32 字节十六进制字符串）。
     *
     * @return Refresh Token
     */
    public String generateRefreshToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /**
     * 获取 Refresh Token 的有效期（毫秒）。
     */
    public long getRefreshExpiration() {
        return refreshExpiration;
    }
}
