package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.peer.PeerReviewRequest;
import com.itss.projectmanagement.dto.response.peer.PeerReviewResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.security.CurrentUser;
import com.itss.projectmanagement.security.UserPrincipal;
import com.itss.projectmanagement.utils.SecurityUtils;
import com.itss.projectmanagement.service.FreeRiderDetectionService;
import com.itss.projectmanagement.service.PeerReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/peer-reviews")
@Tag(name = "Peer Review", description = "Peer Review API")
@RequiredArgsConstructor
public class PeerReviewController {

    private final PeerReviewService peerReviewService;
    private final FreeRiderDetectionService freeRiderDetectionService;

    @PostMapping
    @Operation(summary = "Submit a peer review")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<PeerReviewResponse>> submitReview(
            @Valid @RequestBody PeerReviewRequest request,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        PeerReviewResponse response = peerReviewService.submitReview(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Peer review submitted successfully"));
    }

    @PostMapping("/start-review")
    @Operation(summary = "Start peer review process for a group (group leader only)")
    @PreAuthorize("hasAuthority('STUDENT')")  
    public ResponseEntity<ApiResponse<Void>> startPeerReviewForGroup(
            @RequestParam Long groupId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        peerReviewService.startPeerReviewForGroup(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Peer review process has been started for your group"));
    }

    @GetMapping("/submitted")
    @Operation(summary = "Get reviews submitted by the current user for a project")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<PeerReviewResponse>>> getSubmittedReviews(
            @RequestParam Long projectId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        List<PeerReviewResponse> reviews = peerReviewService.getReviewsByReviewer(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Fetched submitted reviews successfully"));
    }

    @GetMapping("/received")
    @Operation(summary = "Get reviews received by the current user for a project")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<PeerReviewResponse>>> getReceivedReviews(
            @RequestParam Long projectId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        List<PeerReviewResponse> reviews = peerReviewService.getReviewsByReviewee(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Fetched received reviews successfully"));
    }

    @GetMapping("/members-to-review")
    @Operation(summary = "Get list of team members that need to be reviewed by the current user")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<User>>> getMembersToReview(
            @RequestParam Long projectId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        List<User> members = peerReviewService.getMembersToReview(projectId, userId);
        return ResponseEntity.ok(ApiResponse.success(members, "Fetched members to review successfully"));
    }

    @GetMapping("/completion-status")
    @Operation(summary = "Check if the current user has completed all required peer reviews")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Boolean>> hasCompletedAllReviews(
            @RequestParam Long projectId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        boolean completed = peerReviewService.hasCompletedAllReviews(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(completed, "Checked completion status successfully"));
    }

    @GetMapping("/free-riders")
    @Operation(summary = "Detect free riders in a project")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<User>>> detectFreeRiders(
            @RequestParam Long projectId) {
        List<User> freeRiders = freeRiderDetectionService.detectFreeRiders(projectId);
        return ResponseEntity.ok(ApiResponse.success(freeRiders, "Detected free riders successfully"));
    }

    @GetMapping("/free-rider-risk")
    @Operation(summary = "Get free rider risk scores for all users in a project")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Map<Long, Double>>> getFreeRiderRiskScores(
            @RequestParam Long projectId) {
        Map<Long, Double> riskScores = freeRiderDetectionService.getFreeRiderRiskScores(projectId);
        return ResponseEntity.ok(ApiResponse.success(riskScores, "Fetched free rider risk scores successfully"));
    }

    @GetMapping("/free-rider-report")
    @Operation(summary = "Generate report about potential free riders in a project")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')") 
    public ResponseEntity<ApiResponse<String>> generateFreeRiderReport(
            @RequestParam Long projectId) {
        String report = freeRiderDetectionService.generateFreeRiderReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(report, "Generated free rider report successfully"));
    }
}