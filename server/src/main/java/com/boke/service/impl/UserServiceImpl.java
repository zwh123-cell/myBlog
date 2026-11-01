package com.boke.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.boke.entity.User;
import com.boke.mapper.UserMapper;
import com.boke.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    /**
     * 按邮箱查询用户，邮箱为唯一索引，最多返回一条。
     */
    @Override
    public User getByEmail(String email) {
        return lambdaQuery().eq(User::getEmail, email).one();
    }

    /**
     * 创建用户，写入数据库后返回带自增主键的实体。
     */
    @Override
    public User createUser(User user) {
        save(user);
        return user;
    }
}
