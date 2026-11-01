package com.boke.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.boke.entity.User;

/**
 * 用户业务接口，提供用户数据的查询与创建能力。
 */
public interface UserService extends IService<User> {

    /**
     * 按邮箱查询用户。
     *
     * @param email 登录邮箱
     * @return 匹配的用户，不存在时返回 null
     */
    User getByEmail(String email);

    /**
     * 创建用户。
     *
     * @param user 待创建的用户实体
     * @return 创建后带主键的用户实体
     */
    User createUser(User user);
}
