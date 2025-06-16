package com.example.RhNova.repositories.Candidatrepo;

import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CandidatRepository extends MongoRepository<User, String> {
    List<User> findByRole(Role role);
}
