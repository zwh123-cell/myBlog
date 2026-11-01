package com.boke.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体，映射 users 表。
 */
@Data
@TableName("users")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 登录邮箱，唯一 */
    private String email;

    /** 密码哈希（BCrypt） */
    private String passwordHash;

    /** 昵称 */
    private String nickname;

    /** 头像地址 */
    private String avatarUrl;

    /** 个人简介 */
    private String bio;

    /** 角色：user / admin */
    private String role;

    /** 状态：active / banned */
    private String status;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
