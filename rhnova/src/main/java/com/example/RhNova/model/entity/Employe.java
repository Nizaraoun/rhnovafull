package com.example.RhNova.model.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "employes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Employe {

    @Id
    private String id;

    private String firstName;
    private String lastName;
    
    @Indexed(unique = true)
    private String email;
    
    private String phone;
    private String department;
    private String position;
    private String status; // 'active', 'inactive', 'on-leave'
    private LocalDate joinDate;
    private Double salary;
    private List<String> skills;
    private String managerID;

    // Helper method to get full name
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    // Check if employee is active
    public boolean isActive() {
        return "active".equals(status);
    }
}
