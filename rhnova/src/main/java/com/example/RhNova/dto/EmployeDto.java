package com.example.RhNova.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class EmployeDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String position;
    private String status; // 'active', 'inactive', 'on-leave'
    private LocalDate joinDate;
    private Double salary;
    private List<String> skills;
    private String managerID;
    
    // Computed field
    private String fullName;
    
    // Account management fields
    private Boolean hasAccount;
    private String userId;
}
