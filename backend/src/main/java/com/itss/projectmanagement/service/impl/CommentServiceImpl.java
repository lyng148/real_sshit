package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.converter.CommentConverter;
import com.itss.projectmanagement.dto.response.comment.CommentDTO;
import com.itss.projectmanagement.dto.request.comment.CommentRequest;
import com.itss.projectmanagement.entity.Comment;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.exception.UnauthorizedAccessException;
import com.itss.projectmanagement.repository.CommentRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.ICommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements ICommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentConverter commentConverter;
    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;

    @Override
    public CommentDTO createComment(CommentRequest request, Long authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + authorId));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .task(task)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return commentConverter.toDTO(savedComment);
    }

    @Override
    public CommentDTO updateComment(Long id, CommentRequest request, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Only the author can update their own comment
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to update this comment");
        }

        // We're only allowing content updates, not changing the task
        comment.setContent(request.getContent());

        Comment updatedComment = commentRepository.save(comment);
        return commentConverter.toDTO(updatedComment);
    }

    @Override
    public void deleteComment(Long id, Long userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        // Allow deletion by comment author or task group leader or project instructor
        if (!comment.getAuthor().getId().equals(userId) && 
            !isGroupLeader(userId, comment.getTask().getGroup().getId()) && 
            !isProjectInstructor(userId, comment.getTask().getGroup().getProject().getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Override
    public CommentDTO getComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        return commentConverter.toDTO(comment);
    }

    @Override
    public List<CommentDTO> getCommentsForTask(Long taskId) {
        // Verify task exists
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with id: " + taskId);
        }
        
        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return commentConverter.toDTOList(comments);
    }
    
    /**
     * Helper method to check if a user is the group leader
     * @param userId User ID to check
     * @param groupId Group ID to check
     * @return true if the user is the leader of the specified group
     */
    private boolean isGroupLeader(Long userId, Long groupId) {
        Optional<Group> groupOptional = Optional.ofNullable(groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found")));
        if (groupOptional.isPresent()) {
            Group group = groupOptional.get();
            User leader = group.getLeader();
            return leader != null && leader.getId().equals(userId);
        }
        return false;
    }
    
    /**
     * Helper method to check if a user is the instructor for the project
     * @param userId User ID to check
     * @param projectId Project ID to check
     * @return true if the user is the instructor of the specified project
     */
    private boolean isProjectInstructor(Long userId, Long projectId) {
        Optional<Project> projectOptional = projectRepository.findById(projectId);
        if (projectOptional.isPresent()) {
            Project project = projectOptional.get();
            User instructor = project.getInstructor();
            return instructor != null && instructor.getId().equals(userId);
        }
        return false;
    }
}