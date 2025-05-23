package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.response.freerider.FreeRiderCaseDTO;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.service.IFreeRiderDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/free-rider-detection")
@RequiredArgsConstructor
public class FreeRiderDetectionController {

    private final IFreeRiderDetectionService freeRiderDetectionService;

    /**
     * Detect free riders in a project without sending notifications (for UI display)
     * @param projectId Project ID
     * @return List of free riders
     */    
       
    @GetMapping("/detect")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> detectFreeRiders(@RequestParam Long projectId) {
        List<UserDTO> freeRiderDTOs = freeRiderDetectionService.detectFreeRidersWithoutNotification(projectId);
        return ResponseEntity.ok(
                ApiResponse.<List<UserDTO>>builder()
                        .success(true)
                        .message("Free riders detected successfully")
                        .data(freeRiderDTOs)
                        .build()
        );
    }
    
    /**
     * Detect free riders in a project and send notifications (for scheduled jobs)
     * @param projectId Project ID
     * @return List of free riders
     */    @GetMapping("/detect-with-notifications")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> detectFreeRidersWithNotifications(@RequestParam Long projectId) {
        List<UserDTO> freeRiderDTOs = freeRiderDetectionService.detectFreeRiders(projectId);
        return ResponseEntity.ok(
                ApiResponse.<List<UserDTO>>builder()
                        .success(true)
                        .message("Free riders detected and notifications sent successfully")
                        .data(freeRiderDTOs)
                        .build()
        );
    }

    /**
     * Manually trigger free rider detection with notifications
     * This endpoint is useful for admins to force a check outside the scheduled time
     * @param projectId Project ID
     * @return List of free riders
     */      
    @PostMapping("/trigger-detection")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> triggerFreeRiderDetection(@RequestParam Long projectId) {
        List<UserDTO> freeRiderDTOs = freeRiderDetectionService.detectFreeRiders(projectId);
        return ResponseEntity.ok(
                ApiResponse.<List<UserDTO>>builder()
                        .success(true)
                        .message("Free rider detection triggered successfully, notifications sent if needed")
                        .data(freeRiderDTOs)
                        .build()
        );
    }

    /**
     * Get free rider risk scores for all users in a project
     * @param projectId Project ID
     * @return Map of user IDs to risk scores
     */
    @GetMapping("/risk-scores")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<Map<Long, Double>>> getFreeRiderRiskScores(@RequestParam Long projectId) {
        Map<Long, Double> riskScores = freeRiderDetectionService.getFreeRiderRiskScores(projectId);
        return ResponseEntity.ok(
                ApiResponse.<Map<Long, Double>>builder()
                        .success(true)
                        .message("Free rider risk scores retrieved successfully")
                        .data(riskScores)
                        .build()
        );
    }

    /**
     * Get detailed evidence for a specific free rider
     * @param projectId Project ID
     * @param userId User ID
     * @return Evidence data
     */
    @GetMapping("/evidence")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFreeRiderEvidence(
            @RequestParam Long projectId,
            @RequestParam Long userId) {
        // This method needs to be implemented in the service
        Map<String, Object> evidence = freeRiderDetectionService.getFreeRiderEvidence(userId, projectId);
        return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                        .success(true)
                        .message("Free rider evidence retrieved successfully")
                        .data(evidence)
                        .build()
        );
    }    
    
    /**
     * Calculate risk score for a specific user in a project
     * @param projectId Project ID
     * @param userId User ID
     * @return Risk score
     */
    @GetMapping("/user-risk-score")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<Double>> calculateUserRiskScore(
            @RequestParam Long projectId,
            @RequestParam Long userId) {
        Double riskScore = freeRiderDetectionService.calculateFreeRiderRiskScore(userId, projectId);
        return ResponseEntity.ok(
                ApiResponse.<Double>builder()
                        .success(true)
                        .message("User risk score calculated successfully")
                        .data(riskScore)
                        .build()
        );
    }
    /**
     * Get free rider evidence for a group or all groups in a project
     * @param projectId Project ID
     * @param groupId Group ID (optional)
     * @return Group evidence data
     */
    @GetMapping("/group-evidence")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGroupFreeRiderEvidence(
            @RequestParam Long projectId,
            @RequestParam(required = false) Long groupId) {
        Map<String, Object> evidence = freeRiderDetectionService.getGroupFreeRiderEvidence(projectId, groupId);
        return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                        .success(true)
                        .message("Group free rider evidence retrieved successfully")
                        .data(evidence)
                        .build()
        );
    }
    
    /**
     * Get all free rider cases for a project
     * @param projectId Project ID
     * @return List of cases
     */    
    @GetMapping("/cases")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<List<FreeRiderCaseDTO>>> getFreeRiderCases(@RequestParam Long projectId) {
        List<FreeRiderCaseDTO> cases = freeRiderDetectionService.getFreeRiderCases(projectId);
        return ResponseEntity.ok(
                ApiResponse.<List<FreeRiderCaseDTO>>builder()
                        .success(true)
                        .message("Free rider cases retrieved successfully")
                        .data(cases)
                        .build()
        );
    }
      
    /**
     * Create a new free rider case
     * @param projectId Project ID
     * @param userId User ID to mark as free rider
     * @return Created case
     */
    @PostMapping("/create-case")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<FreeRiderCaseDTO>> createFreeRiderCase(
            @RequestParam Long projectId,
            @RequestParam Long userId) {
        FreeRiderCaseDTO newCase = freeRiderDetectionService.createFreeRiderCase(userId, projectId);
        return ResponseEntity.ok(
                ApiResponse.<FreeRiderCaseDTO>builder()
                        .success(true)
                        .message("Free rider case created successfully")
                        .data(newCase)
                        .build()
        );
    }
      
    /**
     * Resolve a free rider case
     * @param caseId Case ID
     * @param resolution Resolution method
     * @param notes Additional notes
     * @return Updated case
     */
    @PostMapping("/resolve/{caseId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")    
    public ResponseEntity<ApiResponse<FreeRiderCaseDTO>> resolveFreeRiderCase(
            @PathVariable Long caseId,
            @RequestParam String resolution,
            @RequestParam String notes) {
        FreeRiderCaseDTO updatedCase = freeRiderDetectionService.resolveFreeRiderCase(caseId, resolution, notes);
        return ResponseEntity.ok(
                ApiResponse.<FreeRiderCaseDTO>builder()
                        .success(true)
                        .message("Free rider case resolved successfully")
                        .data(updatedCase)
                        .build()
        );
    }
}
