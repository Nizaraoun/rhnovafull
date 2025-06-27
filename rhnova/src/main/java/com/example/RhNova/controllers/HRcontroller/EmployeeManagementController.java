package com.example.RhNova.controllers.HRcontroller;

import com.example.RhNova.dto.CreateEmployeeAccountDto;
import com.example.RhNova.dto.EmployeDto;
import com.example.RhNova.dto.EmployeeSearchCriteriaDto;
import com.example.RhNova.services.HRservice.EmployeeManagementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/hr/employees")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeManagementController {

    @Autowired
    private EmployeeManagementService employeeService;

    // ================== BASIC CRUD OPERATIONS ==================

    /**
     * Get all employees
     */
    @GetMapping
    public ResponseEntity<List<EmployeDto>> getAllEmployees() {
        try {
            List<EmployeDto> employees = employeeService.getAllEmployees();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get employee by ID
     */
    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeDto> getEmployeeById(@PathVariable String employeeId) {
        try {
            EmployeDto employee = employeeService.getEmployeeById(employeeId);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get employee by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<EmployeDto> getEmployeeByEmail(@PathVariable String email) {
        try {
            EmployeDto employee = employeeService.getEmployeeByEmail(email);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create new employee
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEmployee(@RequestBody EmployeDto employeDto) {
        try {
            String hrId = "current-hr-user"; // In real app, get from authentication context
            EmployeDto createdEmployee = employeeService.createEmployee(employeDto, hrId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employee created successfully");
            response.put("employee", createdEmployee);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update employee
     */
    @PutMapping("/{employeeId}")
    public ResponseEntity<Map<String, Object>> updateEmployee(
            @PathVariable String employeeId, 
            @RequestBody EmployeDto employeDto) {
        try {
            String hrId = "current-hr-user"; // In real app, get from authentication context
            EmployeDto updatedEmployee = employeeService.updateEmployee(employeeId, employeDto, hrId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employee updated successfully");
            response.put("employee", updatedEmployee);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete employee
     */
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Map<String, Object>> deleteEmployee(@PathVariable String employeeId) {
        try {
            boolean deleted = employeeService.deleteEmployee(employeeId);
            Map<String, Object> response = new HashMap<>();
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Employee deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to delete employee");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== STATUS MANAGEMENT ==================

    /**
     * Deactivate employee
     */
    @PutMapping("/{employeeId}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateEmployee(
            @PathVariable String employeeId,
            @RequestParam(required = false, defaultValue = "Deactivated by HR") String reason) {
        try {
            boolean deactivated = employeeService.deactivateEmployee(employeeId, reason);
            Map<String, Object> response = new HashMap<>();
            
            if (deactivated) {
                response.put("success", true);
                response.put("message", "Employee deactivated successfully");
                response.put("reason", reason);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to deactivate employee");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get employees by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getEmployeesByStatus(@PathVariable String status) {
        try {
            List<EmployeDto> employees = employeeService.getEmployeesByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", status);
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees by status");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== DEPARTMENT AND POSITION QUERIES ==================

    /**
     * Get employees by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<Map<String, Object>> getEmployeesByDepartment(@PathVariable String department) {
        try {
            List<EmployeDto> employees = employeeService.getEmployeesByDepartment(department);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("department", department);
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees by department");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get employees by position
     */
    @GetMapping("/position/{position}")
    public ResponseEntity<Map<String, Object>> getEmployeesByPosition(@PathVariable String position) {
        try {
            List<EmployeDto> employees = employeeService.getEmployeesByPosition(position);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("position", position);
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees by position");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== SEARCH OPERATIONS ==================

    /**
     * Search employees with criteria
     */
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchEmployees(@RequestBody EmployeeSearchCriteriaDto criteria) {
        try {
            List<EmployeDto> employees = employeeService.searchEmployees(criteria);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("criteria", criteria);
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to search employees");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== ACCOUNT MANAGEMENT ==================

    /**
     * Check if employee has account
     */
    @GetMapping("/{employeeId}/account-status")
    public ResponseEntity<Map<String, Object>> checkEmployeeHasAccount(@PathVariable String employeeId) {
        try {
            boolean hasAccount = employeeService.checkEmployeeHasAccount(employeeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("employeeId", employeeId);
            response.put("hasAccount", hasAccount);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to check account status");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Create account for employee
     */
    @PostMapping("/{employeeId}/create-account")
    public ResponseEntity<Map<String, Object>> createAccountForEmployee(
            @PathVariable String employeeId,
            @RequestBody CreateEmployeeAccountDto accountDto) {
        try {
            EmployeDto employee = employeeService.createAccountForEmployee(employeeId, accountDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Account created successfully for employee");
            response.put("employee", employee);
            response.put("sendWelcomeEmail", accountDto.getSendWelcomeEmail());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to create account");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Link employee to existing user account
     */
    @PutMapping("/{employeeId}/link-account/{userId}")
    public ResponseEntity<Map<String, Object>> linkEmployeeToUser(
            @PathVariable String employeeId,
            @PathVariable String userId) {
        try {
            boolean linked = employeeService.linkEmployeeToUser(employeeId, userId);
            
            Map<String, Object> response = new HashMap<>();
            if (linked) {
                response.put("success", true);
                response.put("message", "Employee linked to user account successfully");
                response.put("employeeId", employeeId);
                response.put("userId", userId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to link employee to user account");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Unlink employee from user account
     */
    @DeleteMapping("/{employeeId}/unlink-account")
    public ResponseEntity<Map<String, Object>> unlinkEmployeeFromUser(@PathVariable String employeeId) {
        try {
            boolean unlinked = employeeService.unlinkEmployeeFromUser(employeeId);
            
            Map<String, Object> response = new HashMap<>();
            if (unlinked) {
                response.put("success", true);
                response.put("message", "Employee unlinked from user account successfully");
                response.put("employeeId", employeeId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to unlink employee from user account");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get employees without accounts
     */
    @GetMapping("/without-accounts")
    public ResponseEntity<Map<String, Object>> getEmployeesWithoutAccounts() {
        try {
            List<EmployeDto> employees = employeeService.getEmployeesWithoutAccounts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees without accounts");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== STATISTICS ==================

    /**
     * Get employee statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getEmployeeStatistics() {
        try {
            Map<String, Object> statistics = employeeService.getEmployeeStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve statistics");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get department statistics
     */
    @GetMapping("/statistics/departments")
    public ResponseEntity<Map<String, Object>> getDepartmentStatistics() {
        try {
            Map<String, Object> statistics = employeeService.getEmployeeStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("departmentDistribution", statistics.get("departmentDistribution"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve department statistics");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get position statistics
     */
    @GetMapping("/statistics/positions")
    public ResponseEntity<Map<String, Object>> getPositionStatistics() {
        try {
            Map<String, Object> statistics = employeeService.getEmployeeStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("positionDistribution", statistics.get("positionDistribution"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve position statistics");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== BULK OPERATIONS ==================

    /**
     * Bulk update employees
     */
    @PutMapping("/bulk")
    public ResponseEntity<Map<String, Object>> bulkUpdateEmployees(@RequestBody List<EmployeDto> employees) {
        try {
            String hrId = "current-hr-user"; // In real app, get from authentication context
            List<EmployeDto> updatedEmployees = employeeService.bulkUpdateEmployees(employees, hrId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bulk update completed");
            response.put("processedCount", updatedEmployees.size());
            response.put("requestedCount", employees.size());
            response.put("updatedEmployees", updatedEmployees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Bulk update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Bulk delete employees
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, Object>> bulkDeleteEmployees(@RequestBody List<String> employeeIds) {
        try {
            boolean allDeleted = employeeService.bulkDeleteEmployees(employeeIds);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", allDeleted);
            response.put("message", allDeleted ? "All employees deleted successfully" : "Some employees could not be deleted");
            response.put("processedIds", employeeIds);
            response.put("totalRequested", employeeIds.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Bulk delete failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== ADDITIONAL UTILITY ENDPOINTS ==================

    /**
     * Get employees by salary range
     */
    @GetMapping("/salary-range")
    public ResponseEntity<Map<String, Object>> getEmployeesBySalaryRange(
            @RequestParam Double min,
            @RequestParam Double max) {
        try {
            EmployeeSearchCriteriaDto criteria = new EmployeeSearchCriteriaDto();
            criteria.setMinSalary(min);
            criteria.setMaxSalary(max);
            
            List<EmployeDto> employees = employeeService.searchEmployees(criteria);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("salaryRange", Map.of("min", min, "max", max));
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees by salary range");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get recently hired employees (last 30 days)
     */
    @GetMapping("/recent-hires")
    public ResponseEntity<Map<String, Object>> getRecentlyHiredEmployees() {
        try {
            EmployeeSearchCriteriaDto criteria = new EmployeeSearchCriteriaDto();
            criteria.setJoinDateAfter(java.time.LocalDate.now().minusDays(30));
            
            List<EmployeDto> employees = employeeService.searchEmployees(criteria);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("period", "Last 30 days");
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve recently hired employees");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get employees by join date range
     */
    @GetMapping("/join-date-range")
    public ResponseEntity<Map<String, Object>> getEmployeesByJoinDateRange(
            @RequestParam String start,
            @RequestParam String end) {
        try {
            EmployeeSearchCriteriaDto criteria = new EmployeeSearchCriteriaDto();
            criteria.setJoinDateAfter(java.time.LocalDate.parse(start));
            criteria.setJoinDateBefore(java.time.LocalDate.parse(end));
            
            List<EmployeDto> employees = employeeService.searchEmployees(criteria);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("dateRange", Map.of("start", start, "end", end));
            response.put("count", employees.size());
            response.put("employees", employees);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to retrieve employees by join date range");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ================== HEALTH CHECK ==================

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("status", "Employee Management Service is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    // ================== VALIDATION ENDPOINTS ==================

    /**
     * Validate employee email uniqueness
     */
    @GetMapping("/validate/email/{email}")
    public ResponseEntity<Map<String, Object>> validateEmailUniqueness(@PathVariable String email) {
        try {
            // Try to get employee by email - if found, email is not unique
            employeeService.getEmployeeByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isUnique", false);
            response.put("message", "Email is already in use");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Employee not found - email is unique
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isUnique", true);
            response.put("message", "Email is available");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to validate email");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
