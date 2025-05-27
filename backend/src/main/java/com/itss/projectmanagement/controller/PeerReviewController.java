package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.peer.PeerReviewRequest;
import com.itss.projectmanagement.dto.response.peer.PeerReviewResponse;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import com.itss.projectmanagement.exception.ValidationException;
import com.itss.projectmanagement.security.CurrentUser;
import com.itss.projectmanagement.security.UserPrincipal;
import com.itss.projectmanagement.utils.SecurityUtils;
import com.itss.projectmanagement.service.IFreeRiderDetectionService;
import com.itss.projectmanagement.service.IPeerReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    private final IPeerReviewService peerReviewService;
    private final IFreeRiderDetectionService freeRiderDetectionService;

    @PostMapping
    @Operation(summary = "Submit a peer review")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Peer review submitted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
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
    }    @PostMapping("/start-review")
    @Operation(summary = "Start peer review process for a group (group leader only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Peer review process has been started for your group"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad request - validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAuthority('STUDENT')")  
    public ResponseEntity<ApiResponse<Void>> startPeerReviewForGroup(
            @RequestParam Long groupId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
            }
            peerReviewService.startPeerReviewForGroup(groupId, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Peer review process has been started for your group"));
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/submitted")
    @Operation(summary = "Get reviews submitted by the current user for a project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fetched submitted reviews successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fetched received reviews successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fetched members to review successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getMembersToReview(
            @RequestParam Long projectId,
            @CurrentUser UserPrincipal currentUser) {
        Long userId = (currentUser != null) ? currentUser.getId() : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized", HttpStatus.UNAUTHORIZED));
        }
        List<UserSummaryDTO> members = peerReviewService.getMembersToReview(projectId, userId);
        return ResponseEntity.ok(ApiResponse.success(members, "Fetched members to review successfully"));
    }

    @GetMapping("/completion-status")
    @Operation(summary = "Check if the current user has completed all required peer reviews")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Checked completion status successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Detected free riders successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> detectFreeRiders(
            @RequestParam Long projectId) {
        List<UserDTO> freeRiders = freeRiderDetectionService.detectFreeRiders(projectId);
        return ResponseEntity.ok(ApiResponse.success(freeRiders, "Detected free riders successfully"));
    }

    @GetMapping("/free-rider-risk")
    @Operation(summary = "Get free rider risk scores for all users in a project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Fetched free rider risk scores successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Map<Long, Double>>> getFreeRiderRiskScores(
            @RequestParam Long projectId) {
        Map<Long, Double> riskScores = freeRiderDetectionService.getFreeRiderRiskScores(projectId);
        return ResponseEntity.ok(ApiResponse.success(riskScores, "Fetched free rider risk scores successfully"));
    }

    @GetMapping("/free-rider-report")
    @Operation(summary = "Generate report about potential free riders in a project")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Generated free rider report successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')") 
    public ResponseEntity<ApiResponse<String>> generateFreeRiderReport(
            @RequestParam Long projectId) {
        String report = freeRiderDetectionService.generateFreeRiderReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(report, "Generated free rider report successfully"));
    }
}