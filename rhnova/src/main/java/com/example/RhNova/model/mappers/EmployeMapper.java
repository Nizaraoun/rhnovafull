package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.EmployeDto;
import com.example.RhNova.model.entity.Employe;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class EmployeMapper {

    @Autowired
    private UserRepository userRepository;

    public EmployeDto toDTO(Employe employe) {
        if (employe == null) return null;

        EmployeDto dto = new EmployeDto();
        dto.setId(employe.getId());
        dto.setFirstName(employe.getFirstName());
        dto.setLastName(employe.getLastName());
        dto.setEmail(employe.getEmail());
        dto.setPhone(employe.getPhone());
        dto.setDepartment(employe.getDepartment());
        dto.setPosition(employe.getPosition());
        dto.setStatus(employe.getStatus());
        dto.setJoinDate(employe.getJoinDate());
        dto.setSalary(employe.getSalary());
        dto.setSkills(employe.getSkills());
        dto.setManagerID(employe.getManagerID());
        
        // Computed fields
        dto.setFullName(employe.getFullName());
        
        // Check if user has account
        Optional<User> user = userRepository.findByEmail(employe.getEmail());
        dto.setHasAccount(user.isPresent());
        dto.setUserId(user.isPresent() ? user.get().getId() : null);

        return dto;
    }

    public Employe toEntity(EmployeDto dto) {
        if (dto == null) return null;

        Employe employe = new Employe();
        employe.setId(dto.getId());
        employe.setFirstName(dto.getFirstName());
        employe.setLastName(dto.getLastName());
        employe.setEmail(dto.getEmail());
        employe.setPhone(dto.getPhone());
        employe.setDepartment(dto.getDepartment());
        employe.setPosition(dto.getPosition());
        employe.setStatus(dto.getStatus());
        employe.setJoinDate(dto.getJoinDate());
        employe.setSalary(dto.getSalary());
        employe.setSkills(dto.getSkills());
        employe.setManagerID(dto.getManagerID());

        return employe;
    }

    // Static methods for backward compatibility
    public static EmployeDto toDTOStatic(Employe employe) {
        if (employe == null) return null;

        EmployeDto dto = new EmployeDto();
        dto.setId(employe.getId());
        dto.setFirstName(employe.getFirstName());
        dto.setLastName(employe.getLastName());
        dto.setEmail(employe.getEmail());
        dto.setPhone(employe.getPhone());
        dto.setDepartment(employe.getDepartment());
        dto.setPosition(employe.getPosition());
        dto.setStatus(employe.getStatus());
        dto.setJoinDate(employe.getJoinDate());
        dto.setSalary(employe.getSalary());
        dto.setSkills(employe.getSkills());
        dto.setManagerID(employe.getManagerID());
        dto.setFullName(employe.getFullName());
        dto.setHasAccount(false); // Default, needs service check
        dto.setUserId(null);

        return dto;
    }

    public static Employe toEntityStatic(EmployeDto dto) {
        if (dto == null) return null;

        Employe employe = new Employe();
        employe.setId(dto.getId());
        employe.setFirstName(dto.getFirstName());
        employe.setLastName(dto.getLastName());
        employe.setEmail(dto.getEmail());
        employe.setPhone(dto.getPhone());
        employe.setDepartment(dto.getDepartment());
        employe.setPosition(dto.getPosition());
        employe.setStatus(dto.getStatus());
        employe.setJoinDate(dto.getJoinDate());
        employe.setSalary(dto.getSalary());
        employe.setSkills(dto.getSkills());
        employe.setManagerID(dto.getManagerID());

        return employe;
    }
}
