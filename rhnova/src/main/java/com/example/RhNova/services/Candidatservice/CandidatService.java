package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.repositories.Candidatrepo.CandidatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidatService {

    @Autowired
    private CandidatRepository candidatRepository;

    public List<User> getAllCandidats() {
        return candidatRepository.findByRole(Role.CANDIDAT);
    }

    public User getCandidatById(String id) {
        return candidatRepository.findById(id)
                .filter(user -> user.getRole() == Role.CANDIDAT)
                .orElse(null);
    }
}
