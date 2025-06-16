package com.example.RhNova.controllers.AdminController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.services.Adminservice.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")

public class AdminController {

    @Autowired
    private AdminService adminService;

   
    @GetMapping("/users")
    public List<userdto> getAllUsers() {
        System.out.println("Fetching all users+++++++++++++++++++");
        return adminService.getAllUsers();
    }

  
    @GetMapping("/users/{id}")
    public userdto getUserById(@PathVariable String id) {
        return adminService.getUserById(id);
    }


    @PostMapping("/users")
    public userdto createUser(@RequestBody userdto dto) {
        return adminService.createUser(dto);
    }

   
    @PutMapping("/users/{id}")
    public userdto updateUser(@PathVariable String id, @RequestBody userdto dto) {
        return adminService.updateUser(id, dto);
    }

   
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
    }

    // Changer le rôle d’un utilisateur
    @PatchMapping("/users/{id}/role")
    public userdto changeUserRole(@PathVariable String id, @RequestParam Role newRole) {
        return adminService.changeUserRole(id, newRole);
    }
}
    
