package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.CreateEmployeeAccountDto;
import com.example.RhNova.dto.EmployeDto;
import com.example.RhNova.dto.EmployeeSearchCriteriaDto;

import java.util.List;
import java.util.Map;

public interface EmployeeManagementService {

    // Basic CRUD operations
    EmployeDto createEmployee(EmployeDto employeDto, String hrId);
    EmployeDto updateEmployee(String employeeId, EmployeDto employeDto, String hrId);
    EmployeDto getEmployeeById(String employeeId);
    EmployeDto getEmployeeByEmail(String email);
    List<EmployeDto> getAllEmployees();
    boolean deleteEmployee(String employeeId);
    
    // Status management
    boolean deactivateEmployee(String employeeId, String reason);
    
    // Search and filter
    List<EmployeDto> searchEmployees(EmployeeSearchCriteriaDto criteria);
    List<EmployeDto> getEmployeesByDepartment(String department);
    List<EmployeDto> getEmployeesByPosition(String position);
    List<EmployeDto> getEmployeesByStatus(String status);
    
    // Account management
    boolean checkEmployeeHasAccount(String employeeId);
    EmployeDto createAccountForEmployee(String employeeId, CreateEmployeeAccountDto accountDto);
    boolean linkEmployeeToUser(String employeeId, String userId);
    boolean unlinkEmployeeFromUser(String employeeId);
    List<EmployeDto> getEmployeesWithoutAccounts();
    
    // Statistics
    Map<String, Object> getEmployeeStatistics();
    
    // Bulk operations
    List<EmployeDto> bulkUpdateEmployees(List<EmployeDto> employees, String hrId);
    boolean bulkDeleteEmployees(List<String> employeeIds);
}
