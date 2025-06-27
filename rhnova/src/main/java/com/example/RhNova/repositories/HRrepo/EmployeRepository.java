package com.example.RhNova.repositories.HRrepo;

import com.example.RhNova.model.entity.Employe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeRepository extends MongoRepository<Employe, String> {

    // Find by email
    Optional<Employe> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find by department
    List<Employe> findByDepartment(String department);

    // Find by position
    List<Employe> findByPosition(String position);

    // Find by status
    List<Employe> findByStatus(String status);

    // Count by status
    long countByStatus(String status);

    // Find by manager ID
    List<Employe> findByManagerID(String managerID);

    // Find employees with specific skills
    @Query("{ 'skills': { $in: ?0 } }")
    List<Employe> findBySkillsIn(List<String> skills);

    // Find by department and position
    List<Employe> findByDepartmentAndPosition(String department, String position);

    // Find by salary range
    @Query("{ 'salary': { $gte: ?0, $lte: ?1 } }")
    List<Employe> findBySalaryBetween(Double minSalary, Double maxSalary);

    // Find employees hired after a certain date
    @Query("{ 'joinDate': { $gte: ?0 } }")
    List<Employe> findByJoinDateAfter(LocalDate date);

    // Find employees hired before a certain date
    @Query("{ 'joinDate': { $lte: ?0 } }")
    List<Employe> findByJoinDateBefore(LocalDate date);

    // Search by name (first name or last name)
    @Query("{ $or: [ { 'firstName': { $regex: ?0, $options: 'i' } }, { 'lastName': { $regex: ?0, $options: 'i' } } ] }")
    List<Employe> findByNameContaining(String name);

    // Find by department and status
    List<Employe> findByDepartmentAndStatus(String department, String status);

    // Count employees by department
    @Query(value = "{ 'department': ?0 }", count = true)
    long countByDepartment(String department);

    // Count employees by position
    @Query(value = "{ 'position': ?0 }", count = true)
    long countByPosition(String position);
}
