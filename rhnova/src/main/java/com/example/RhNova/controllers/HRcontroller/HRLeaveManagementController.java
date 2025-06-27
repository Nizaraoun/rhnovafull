package com.example.RhNova.controllers.HRcontroller;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;
import com.example.RhNova.services.HRservice.HRLeaveManagementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/leaves")
@CrossOrigin(origins = "http://localhost:4200")
public class HRLeaveManagementController {

    @Autowired
    private HRLeaveManagementService hrLeaveService;

    /**
     * Get all leave requests for HR management
     */
    @GetMapping("/all")
    public ResponseEntity<List<DemandeCongedto>> getAllLeaveRequests() {
        List<DemandeCongedto> leaves = hrLeaveService.getAllLeaveRequests();
        return ResponseEntity.ok(leaves);
    }

    /**
     * Get leave requests by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DemandeCongedto>> getLeaveRequestsByStatus(
            @PathVariable StatutDemandeConge status) {
        List<DemandeCongedto> leaves = hrLeaveService.getLeaveRequestsByStatus(status);
        return ResponseEntity.ok(leaves);
    }

    /**
     * Get leave requests by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<DemandeCongedto>> getLeaveRequestsByType(
            @PathVariable TypeConge type) {
        List<DemandeCongedto> leaves = hrLeaveService.getLeaveRequestsByType(type);
        return ResponseEntity.ok(leaves);
    }

    /**
     * Get leave requests by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<DemandeCongedto>> getLeaveRequestsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DemandeCongedto> leaves = hrLeaveService.getLeaveRequestsByDateRange(startDate, endDate);
        return ResponseEntity.ok(leaves);
    }

    /**
     * Get pending leave requests (for HR approval)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<DemandeCongedto>> getPendingLeaveRequests() {
        List<DemandeCongedto> leaves = hrLeaveService.getLeaveRequestsByStatus(StatutDemandeConge.EN_ATTENTE);
        return ResponseEntity.ok(leaves);
    }

    /**
     * Approve a leave request
     */
    @PutMapping("/{leaveId}/approve")
    public ResponseEntity<DemandeCongedto> approveLeaveRequest(
            @PathVariable String leaveId,
            @RequestParam String hrId,
            @RequestParam(required = false) String comments) {
        DemandeCongedto approvedLeave = hrLeaveService.approveLeaveRequest(leaveId, hrId, comments);
        return ResponseEntity.ok(approvedLeave);
    }

    /**
     * Reject a leave request
     */
    @PutMapping("/{leaveId}/reject")
    public ResponseEntity<DemandeCongedto> rejectLeaveRequest(
            @PathVariable String leaveId,
            @RequestParam String hrId,
            @RequestParam String comments) {
        DemandeCongedto rejectedLeave = hrLeaveService.rejectLeaveRequest(leaveId, hrId, comments);
        return ResponseEntity.ok(rejectedLeave);
    }

    /**
     * Get leave statistics for dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLeaveStatistics() {
        Map<String, Object> stats = hrLeaveService.getLeaveStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get employee leave history
     */
    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<DemandeCongedto>> getEmployeeLeaveHistory(
            @PathVariable String employeeId) {
        List<DemandeCongedto> leaves = hrLeaveService.getEmployeeLeaveHistory(employeeId);
        return ResponseEntity.ok(leaves);
    }

    /**
     * Create a leave request on behalf of an employee
     */
    @PostMapping("/create-for-employee")
    public ResponseEntity<DemandeCongedto> createLeaveForEmployee(
            @RequestBody DemandeCongedto leaveRequest,
            @RequestParam String hrId) {
        DemandeCongedto createdLeave = hrLeaveService.createLeaveForEmployee(leaveRequest, hrId);
        return ResponseEntity.ok(createdLeave);
    }

    /**
     * Update leave request details
     */
    @PutMapping("/{leaveId}")
    public ResponseEntity<DemandeCongedto> updateLeaveRequest(
            @PathVariable String leaveId,
            @RequestBody DemandeCongedto leaveRequest) {
        DemandeCongedto updatedLeave = hrLeaveService.updateLeaveRequest(leaveId, leaveRequest);
        return ResponseEntity.ok(updatedLeave);
    }

    /**
     * Get leave requests requiring action
     */
    @GetMapping("/requiring-action")
    public ResponseEntity<List<DemandeCongedto>> getLeaveRequestsRequiringAction() {
        List<DemandeCongedto> leaves = hrLeaveService.getLeaveRequestsRequiringAction();
        return ResponseEntity.ok(leaves);
    }

    /**
     * Get monthly leave calendar data
     */
    @GetMapping("/calendar/{year}/{month}")
    public ResponseEntity<List<DemandeCongedto>> getMonthlyLeaveCalendar(
            @PathVariable int year,
            @PathVariable int month) {
        List<DemandeCongedto> leaves = hrLeaveService.getMonthlyLeaveCalendar(year, month);
        return ResponseEntity.ok(leaves);
    }
}
