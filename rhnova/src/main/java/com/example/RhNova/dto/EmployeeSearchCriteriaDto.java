package com.example.RhNova.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class EmployeeSearchCriteriaDto {
    private String name; // Search in first name or last name
    private String email;
    private String department;
    private String position;
    private String status; // active, inactive, on-leave
    private List<String> skills;
    private String managerID;
    
    // Salary range
    private Double minSalary;
    private Double maxSalary;
    
    // Date ranges
    private LocalDate joinDateAfter;
    private LocalDate joinDateBefore;
}
