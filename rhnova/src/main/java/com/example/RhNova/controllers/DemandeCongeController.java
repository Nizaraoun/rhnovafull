package com.example.RhNova.controllers;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.services.DemandeCongeService;
import com.example.RhNova.util.AuthUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin("*")
public class DemandeCongeController {

    private final DemandeCongeService congeService;
    private final AuthUtil authUtil;

    @Autowired
    public DemandeCongeController(DemandeCongeService congeService, AuthUtil authUtil) {
        this.congeService = congeService;
        this.authUtil = authUtil;
    }

    // MANAGER ENDPOINTS

    /**
     * Manager creates a leave request for themselves
     */
    @PostMapping("/manager/create")
    public ResponseEntity<DemandeCongedto> createManagerLeaveRequest(@RequestBody DemandeCongedto dto) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            DemandeCongedto createdLeave = congeService.createManagerLeaveRequest(dto);
            return ResponseEntity.ok(createdLeave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager views their own leave requests
     */
    @GetMapping("/manager/my-requests")
    public ResponseEntity<List<DemandeCongedto>> getManagerLeaveRequests() {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<DemandeCongedto> leaves = congeService.getMyLeaveRequests();
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager views leave requests from their team members
     */
    @GetMapping("/manager/team-requests")
    public ResponseEntity<List<DemandeCongedto>> getTeamLeaveRequests() {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<DemandeCongedto> leaves = congeService.getTeamLeaveRequests();
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager approves/rejects team member leave requests
     */
    @PatchMapping("/manager/{leaveId}/approve")
    public ResponseEntity<DemandeCongedto> approveTeamLeaveRequest(
            @PathVariable String leaveId, 
            @RequestParam(required = false) String comments) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            DemandeCongedto leave = congeService.approveLeaveRequestByManager(leaveId, comments);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/manager/{leaveId}/reject")
    public ResponseEntity<DemandeCongedto> rejectTeamLeaveRequest(
            @PathVariable String leaveId, 
            @RequestParam String comments) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            DemandeCongedto leave = congeService.rejectLeaveRequestByManager(leaveId, comments);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // TEAM MEMBER ENDPOINTS

    /**
     * Team member creates a leave request
     */
    @PostMapping("/member/create")
    public ResponseEntity<DemandeCongedto> createMemberLeaveRequest(@RequestBody DemandeCongedto dto) {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            DemandeCongedto createdLeave = congeService.createMemberLeaveRequest(dto);
            return ResponseEntity.ok(createdLeave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member views their own leave requests
     */
    @GetMapping("/member/my-requests")
    public ResponseEntity<List<DemandeCongedto>> getMemberLeaveRequests() {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<DemandeCongedto> leaves = congeService.getMyLeaveRequests();
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member views their team's leave calendar (to see when colleagues are on leave)
     */
    @GetMapping("/member/team-calendar")
    public ResponseEntity<List<DemandeCongedto>> getTeamLeaveCalendar() {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<DemandeCongedto> leaves = congeService.getTeamLeaveCalendar();
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member updates their own leave request (only if still pending)
     */
    @PutMapping("/member/{leaveId}/update")
    public ResponseEntity<DemandeCongedto> updateMyLeaveRequest(
            @PathVariable String leaveId, 
            @RequestBody DemandeCongedto dto) {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            DemandeCongedto leave = congeService.updateMyLeaveRequest(leaveId, dto);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member cancels their own leave request (only if still pending)
     */
    @DeleteMapping("/member/{leaveId}/cancel")
    public ResponseEntity<Void> cancelMyLeaveRequest(@PathVariable String leaveId) {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            congeService.cancelMyLeaveRequest(leaveId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // COMMON ENDPOINTS

    /**
     * Get leave request details by ID (for authorized users only)
     */
    @GetMapping("/details/{leaveId}")
    public ResponseEntity<DemandeCongedto> getLeaveById(@PathVariable String leaveId) {
        try {
            DemandeCongedto leave = congeService.getLeaveByIdWithAuth(leaveId);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // LEGACY ENDPOINTS (keep for backward compatibility)
   
    @PostMapping("/create")
    public ResponseEntity<DemandeConge> create(@RequestBody DemandeCongedto dto) {
        DemandeConge createdLeave = congeService.createDemande(dto);
        return ResponseEntity.ok(createdLeave);
    }

    @GetMapping("/all")
    public ResponseEntity<List<DemandeConge>> getAll() {
        List<DemandeConge> leaves = congeService.getAll();
        return ResponseEntity.ok(leaves);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        congeService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeConge> getById(@PathVariable String id) {
        // This method would need to be implemented in the service
        return ResponseEntity.ok().build();
    }
}
