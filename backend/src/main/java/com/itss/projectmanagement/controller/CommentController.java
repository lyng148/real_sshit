package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.request.comment.CommentRequest;
import com.itss.projectmanagement.dto.response.comment.CommentDTO;
import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.service.ICommentService;
import com.itss.projectmanagement.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comment Management", description = "APIs for managing comments")
public class CommentController {
    @Autowired
    private ICommentService commentService;

    @Operation(summary = "Create a new comment", description = "Creates a new comment for a task")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Comment created successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = CommentDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','STUDENT')")
    public ResponseEntity<ApiResponse<CommentDTO>> createComment(
            @Valid @RequestBody CommentRequest request) {
        try {
            CommentDTO createdComment = commentService.createComment(request, SecurityUtils.getCurrentUserId());
            
            ApiResponse<CommentDTO> response = ApiResponse.success(
                    createdComment,
                    "Comment created successfully"
            );
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            ApiResponse<CommentDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(summary = "Update comment", description = "Updates an existing comment. Only the author can update their own comment.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comment updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update this comment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','STUDENT')")
    public ResponseEntity<ApiResponse<CommentDTO>> updateComment(
            @Parameter(description = "ID of the comment to update") @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        try {
            CommentDTO updatedComment = commentService.updateComment(id, request, SecurityUtils.getCurrentUserId());
            
            ApiResponse<CommentDTO> response = ApiResponse.success(
                    updatedComment,
                    "Comment updated successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }
            
            ApiResponse<CommentDTO> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        } catch (Exception e) {
            ApiResponse<CommentDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }

    @Operation(summary = "Delete comment", description = "Deletes an existing comment. Comment authors, group leaders, and project instructors can delete comments.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comment deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete this comment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @Parameter(description = "ID of the comment to delete") @PathVariable Long id) {
        try {
            commentService.deleteComment(id, SecurityUtils.getCurrentUserId());
            
            ApiResponse<Void> response = ApiResponse.success(
                    null,
                    "Comment deleted successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }

    @Operation(summary = "Get comment by ID", description = "Retrieves a comment by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comment retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','STUDENT','ADMIN')")
    public ResponseEntity<ApiResponse<CommentDTO>> getComment(
            @Parameter(description = "ID of the comment to retrieve") @PathVariable Long id) {
        try {
            CommentDTO comment = commentService.getComment(id);
            
            ApiResponse<CommentDTO> response = ApiResponse.success(
                    comment,
                    "Comment retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<CommentDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Get comments for task", description = "Retrieves all comments for a specific task")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','STUDENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getCommentsForTask(
            @Parameter(description = "ID of the task") @PathVariable Long taskId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsForTask(taskId);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", comments.size());
            
            ApiResponse<List<CommentDTO>> response = ApiResponse.success(
                    comments,
                    "Comments retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<List<CommentDTO>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}