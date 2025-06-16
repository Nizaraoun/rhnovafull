package com.example.RhNova.controllers.UserController;

import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.mappers.UserMapper;
import com.example.RhNova.services.UserService.userService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class userController {

    @Autowired
    private userService userService;

    @GetMapping
    public List<userdto> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return users.stream().map(UserMapper::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public userdto getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return UserMapper.toDTO(user);
    }
}
