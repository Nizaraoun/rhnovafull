package com.example.RhNova.repositories;

import com.example.RhNova.model.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Recherche d'un utilisateur par email (utile pour login, inscription, etc.)
    Optional<User> findByEmail(String email);

    // Vérifie si un utilisateur existe par email (utile pour éviter les doublons)
    boolean existsByEmail(String email);

    List<User> findByEquipeId(String equipeId);

}
