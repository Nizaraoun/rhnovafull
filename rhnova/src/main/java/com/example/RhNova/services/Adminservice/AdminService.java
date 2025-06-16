package com.example.RhNova.services.Adminservice;



import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.mappers.UserMapper;
import com.example.RhNova.repositories.UserRepository;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    public List<userdto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    
    public userdto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return UserMapper.toDTO(user);
    }

    
    public userdto createUser(userdto dto) {
        User user = UserMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // crypter le mot de passe
        return UserMapper.toDTO(userRepository.save(user));
    }

    
    public userdto updateUser(String id, userdto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        return UserMapper.toDTO(userRepository.save(user));
    }

    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    // Changer le rôle d’un utilisateur
    public userdto changeUserRole(String id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setRole(newRole);
        return UserMapper.toDTO(userRepository.save(user));
    }
}

