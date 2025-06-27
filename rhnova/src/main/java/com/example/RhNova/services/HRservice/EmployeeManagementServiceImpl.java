package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.CreateEmployeeAccountDto;
import com.example.RhNova.dto.EmployeDto;
import com.example.RhNova.dto.EmployeeSearchCriteriaDto;
import com.example.RhNova.model.entity.Employe;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.mappers.EmployeMapper;
import com.example.RhNova.repositories.HRrepo.EmployeRepository;
import com.example.RhNova.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeManagementServiceImpl implements EmployeeManagementService {

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmployeMapper employeMapper;

    @Override
    public EmployeDto createEmployee(EmployeDto employeDto, String hrId) {
        // Validate required fields
        validateEmployeeDto(employeDto);

        // Check if email is unique
        if (employeRepository.existsByEmail(employeDto.getEmail())) {
            throw new RuntimeException("Email already exists: " + employeDto.getEmail());
        }

        Employe employe = employeMapper.toEntity(employeDto);
        
        // Set defaults
        if (employe.getStatus() == null) {
            employe.setStatus("active");
        }

        Employe savedEmploye = employeRepository.save(employe);
        return employeMapper.toDTO(savedEmploye);
    }

    @Override
    public EmployeDto updateEmployee(String employeeId, EmployeDto employeDto, String hrId) {
        Employe existingEmploye = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if email is being changed and is unique
        if (!existingEmploye.getEmail().equals(employeDto.getEmail()) && 
            employeRepository.existsByEmail(employeDto.getEmail())) {
            throw new RuntimeException("Email already exists: " + employeDto.getEmail());
        }

        // Update fields
        existingEmploye.setFirstName(employeDto.getFirstName());
        existingEmploye.setLastName(employeDto.getLastName());
        existingEmploye.setEmail(employeDto.getEmail());
        existingEmploye.setPhone(employeDto.getPhone());
        existingEmploye.setDepartment(employeDto.getDepartment());
        existingEmploye.setPosition(employeDto.getPosition());
        existingEmploye.setStatus(employeDto.getStatus());
        existingEmploye.setJoinDate(employeDto.getJoinDate());
        existingEmploye.setSalary(employeDto.getSalary());
        existingEmploye.setSkills(employeDto.getSkills());
        existingEmploye.setManagerID(employeDto.getManagerID());

        Employe savedEmploye = employeRepository.save(existingEmploye);
        return employeMapper.toDTO(savedEmploye);
    }

    @Override
    public EmployeDto getEmployeeById(String employeeId) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeMapper.toDTO(employe);
    }

    @Override
    public EmployeDto getEmployeeByEmail(String email) {
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeMapper.toDTO(employe);
    }

    @Override
    public List<EmployeDto> getAllEmployees() {
        return employeRepository.findAll().stream()
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteEmployee(String employeeId) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if employee has linked user account
        Optional<User> userAccount = userRepository.findByEmail(employe.getEmail());
        if (userAccount.isPresent()) {
            // You might want to handle this differently - 
            // either delete the user account or just unlink it
            throw new RuntimeException("Cannot delete employee with linked user account. Unlink account first.");
        }

        employeRepository.delete(employe);
        return true;
    }

    @Override
    public boolean deactivateEmployee(String employeeId, String reason) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        employe.setStatus("inactive");
        employeRepository.save(employe);
        return true;
    }

    @Override
    public List<EmployeDto> searchEmployees(EmployeeSearchCriteriaDto criteria) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (criteria.getName() != null && !criteria.getName().trim().isEmpty()) {
            criteriaList.add(new Criteria().orOperator(
                Criteria.where("firstName").regex(criteria.getName(), "i"),
                Criteria.where("lastName").regex(criteria.getName(), "i")
            ));
        }

        if (criteria.getEmail() != null && !criteria.getEmail().trim().isEmpty()) {
            criteriaList.add(Criteria.where("email").regex(criteria.getEmail(), "i"));
        }

        if (criteria.getDepartment() != null && !criteria.getDepartment().trim().isEmpty()) {
            criteriaList.add(Criteria.where("department").regex(criteria.getDepartment(), "i"));
        }

        if (criteria.getPosition() != null && !criteria.getPosition().trim().isEmpty()) {
            criteriaList.add(Criteria.where("position").regex(criteria.getPosition(), "i"));
        }

        if (criteria.getStatus() != null && !criteria.getStatus().trim().isEmpty()) {
            criteriaList.add(Criteria.where("status").is(criteria.getStatus()));
        }

        if (criteria.getSkills() != null && !criteria.getSkills().isEmpty()) {
            criteriaList.add(Criteria.where("skills").in(criteria.getSkills()));
        }

        if (criteria.getManagerID() != null && !criteria.getManagerID().trim().isEmpty()) {
            criteriaList.add(Criteria.where("managerID").is(criteria.getManagerID()));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Employe.class).stream()
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean checkEmployeeHasAccount(String employeeId) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Optional<User> user = userRepository.findByEmail(employe.getEmail());
        return user.isPresent();
    }

    @Override
    public EmployeDto createAccountForEmployee(String employeeId, CreateEmployeeAccountDto accountDto) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if account already exists
        if (userRepository.findByEmail(employe.getEmail()).isPresent()) {
            throw new RuntimeException("User account already exists for this employee");
        }

        // Create new user account
        User newUser = new User();
        newUser.setName(employe.getFullName());
        newUser.setEmail(employe.getEmail());
        newUser.setPassword(passwordEncoder.encode(accountDto.getPassword()));
        newUser.setRole(accountDto.getRole());

        userRepository.save(newUser);
        
        return employeMapper.toDTO(employe);
    }

    @Override
    public boolean linkEmployeeToUser(String employeeId, String userId) {
        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if emails match
        if (!employe.getEmail().equals(user.getEmail())) {
            throw new RuntimeException("Employee and user emails do not match");
        }

        // The linking is implicit through email matching in our simplified model
        return true;
    }    @Override
    public boolean unlinkEmployeeFromUser(String employeeId) {
        // In our simplified model, unlinking means the user account remains 
        // but the employee record is independent
        employeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        return true;
    }

    @Override
    public Map<String, Object> getEmployeeStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalEmployees = employeRepository.count();
        long activeEmployees = employeRepository.countByStatus("active");
        long inactiveEmployees = employeRepository.countByStatus("inactive");
        long onLeaveEmployees = employeRepository.countByStatus("on-leave");
        
        stats.put("totalEmployees", totalEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("inactiveEmployees", inactiveEmployees);
        stats.put("onLeaveEmployees", onLeaveEmployees);
        
        // Department distribution
        List<Employe> allEmployees = employeRepository.findAll();
        Map<String, Long> departmentStats = allEmployees.stream()
                .collect(Collectors.groupingBy(
                    emp -> emp.getDepartment() != null ? emp.getDepartment() : "Unknown",
                    Collectors.counting()
                ));
        stats.put("departmentDistribution", departmentStats);
        
        // Position distribution
        Map<String, Long> positionStats = allEmployees.stream()
                .collect(Collectors.groupingBy(
                    emp -> emp.getPosition() != null ? emp.getPosition() : "Unknown",
                    Collectors.counting()
                ));
        stats.put("positionDistribution", positionStats);
        
        // Account status
        long employeesWithAccount = allEmployees.stream()
                .mapToLong(emp -> userRepository.findByEmail(emp.getEmail()).isPresent() ? 1 : 0)
                .sum();
        stats.put("employeesWithAccount", employeesWithAccount);
        stats.put("employeesWithoutAccount", totalEmployees - employeesWithAccount);
        
        return stats;
    }

    @Override
    public List<EmployeDto> bulkUpdateEmployees(List<EmployeDto> employees, String hrId) {
        List<EmployeDto> updatedEmployees = new ArrayList<>();
        
        for (EmployeDto employeDto : employees) {
            try {
                if (employeDto.getId() != null) {
                    EmployeDto updated = updateEmployee(employeDto.getId(), employeDto, hrId);
                    updatedEmployees.add(updated);
                } else {
                    EmployeDto created = createEmployee(employeDto, hrId);
                    updatedEmployees.add(created);
                }
            } catch (Exception e) {
                // Log error but continue with other employees
                System.err.println("Error updating employee " + employeDto.getEmail() + ": " + e.getMessage());
            }
        }
        
        return updatedEmployees;
    }

    @Override
    public boolean bulkDeleteEmployees(List<String> employeeIds) {
        boolean allDeleted = true;
        
        for (String employeeId : employeeIds) {
            try {
                deleteEmployee(employeeId);
            } catch (Exception e) {
                System.err.println("Error deleting employee " + employeeId + ": " + e.getMessage());
                allDeleted = false;
            }
        }
        
        return allDeleted;
    }

    @Override
    public List<EmployeDto> getEmployeesByDepartment(String department) {
        return employeRepository.findByDepartment(department).stream()
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeDto> getEmployeesByPosition(String position) {
        return employeRepository.findByPosition(position).stream()
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeDto> getEmployeesByStatus(String status) {
        return employeRepository.findByStatus(status).stream()
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeDto> getEmployeesWithoutAccounts() {
        List<Employe> allEmployees = employeRepository.findAll();
        return allEmployees.stream()
                .filter(emp -> !userRepository.findByEmail(emp.getEmail()).isPresent())
                .map(employeMapper::toDTO)
                .collect(Collectors.toList());
    }

    private void validateEmployeeDto(EmployeDto employeDto) {
        if (employeDto.getFirstName() == null || employeDto.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("First name is required");
        }
        if (employeDto.getLastName() == null || employeDto.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Last name is required");
        }
        if (employeDto.getEmail() == null || employeDto.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (employeDto.getDepartment() == null || employeDto.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }
        if (employeDto.getPosition() == null || employeDto.getPosition().trim().isEmpty()) {
            throw new RuntimeException("Position is required");
        }
    }
}
