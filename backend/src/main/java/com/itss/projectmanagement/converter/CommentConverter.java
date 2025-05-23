package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.comment.CommentDTO;
import com.itss.projectmanagement.entity.Comment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommentConverter {

    public CommentDTO toDTO(Comment comment) {
        if (comment == null) {
            return null;
        }
          return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFullName())
                .authorAvatarUrl(comment.getAuthor().getAvatarUrl())
                .taskId(comment.getTask().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
    
    public List<CommentDTO> toDTOList(List<Comment> comments) {
        return comments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}