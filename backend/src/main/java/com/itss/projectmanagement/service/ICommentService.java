package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.comment.CommentDTO;
import com.itss.projectmanagement.dto.request.comment.CommentRequest;

import java.util.List;

public interface ICommentService {
    CommentDTO createComment(CommentRequest request, Long authorId);
    CommentDTO updateComment(Long id, CommentRequest request, Long authorId);
    void deleteComment(Long id, Long userId);
    CommentDTO getComment(Long id);
    List<CommentDTO> getCommentsForTask(Long taskId);
}